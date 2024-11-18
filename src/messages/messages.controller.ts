import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Routes, Services } from 'src/utils/constants';
import { IMessageServices } from './messages';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import { AuthUser } from 'src/utils/decorators';
import { User } from 'src/utils/typeorm';
import { CreateMessageDto } from './dtos/CreateMessageDto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Response } from 'express';

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

  @Delete('/:messageId')
  async deleteConversationId(
    @AuthUser() user: User,
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
  ) {
    const params = { userId: user.id, conversationId, messageId };
    const res = await this.messageService.deleteMessage(params);
  }
}
