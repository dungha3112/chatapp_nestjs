import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Response } from 'express';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { Message, User } from 'src/utils/typeorm';
import { CreateMessageDto } from './dtos/CreateMessageDto';
import { IMessageServices } from './messages';
import { EditMessageDto } from './dtos/EditMessageDto';

@UseGuards(AuthenticatedGuard)
@Controller(Routes.MESSAGES)
export class MessagesController {
  constructor(
    @Inject(Services.MESSAGES)
    private readonly messageService: IMessageServices,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
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
  async getMessagesByConversationId(
    @Param('conversationId', ParseIntPipe) conversationId: number,
  ) {
    const messages =
      await this.messageService.getMessageByConversationId(conversationId);
    return { id: conversationId, messages };
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
    this.eventEmitter.emit('message.edit', { userId, message });
    return message;
  }
}
