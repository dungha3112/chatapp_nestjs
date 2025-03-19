import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { Message, User } from 'src/utils/typeorm';
import { CreateMessageDto } from './dtos/CreateMessageDto';
import { EditMessageDto } from './dtos/EditMessageDto';
import { IMessageServices } from './messages';

@UseGuards(AuthenticatedGuard)
@Controller(Routes.MESSAGES)
export class MessagesController {
  constructor(
    @Inject(Services.MESSAGES)
    private readonly messageService: IMessageServices,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 10 } })
  async createMessage(
    @Res() res: Response,
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @AuthUser() user: User,
    @Body() { content }: CreateMessageDto,
  ) {
    const params = { user, conversationId, content };
    const response = await this.messageService.createMessage(params);

    this.eventEmitter.emit('message.create', response);
    return res.sendStatus(HttpStatus.OK);
  }

  @Get()
  @SkipThrottle()
  async getMessagesByConversationId(
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Query('skip', new DefaultValuePipe(1), ParseIntPipe) skip: number,
  ) {
    const res = await this.messageService.getMessageByConversationId(
      conversationId,
      skip,
    );
    return { id: conversationId, messages: res };
  }

  // api/conversations/:conversationId/messages/:messageId
  @Delete('/:messageId')
  async deleteMessageFromConversation(
    @AuthUser() { id: userId }: User,
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
  ) {
    const params = { userId, conversationId, messageId };
    const message = await this.messageService.deleteMessage(params);

    this.eventEmitter.emit('message.delete', { userId, message });

    return { conversationId, messageId };
  }

  // api/conversations/:conversationId/messages/:messageId
  @Patch('/:messageId')
  async editMessage(
    @AuthUser() { id: userId }: User,
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
    @Body() { content }: EditMessageDto,
  ): Promise<Message> {
    const params = { userId, conversationId, messageId, content };

    const message = await this.messageService.editMessage(params);

    this.eventEmitter.emit('message.edit', message);
    return message;
  }
}
