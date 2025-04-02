import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import {
  MessageAttachmentFileFields,
  Routes,
  Services,
} from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { Message, User } from 'src/utils/typeorm';
import { CreateMessageDto } from './dtos/CreateMessageDto';
import { EditMessageDto } from './dtos/EditMessageDto';
import { IMessageServices } from './messages';
import { Attachment } from 'src/utils/types';
import { EmptyMessageException } from './exceptions/EmptyMessage';

// @UseGuards(AuthenticatedGuard)
@Controller(Routes.MESSAGES)
export class MessagesController {
  constructor(
    @Inject(Services.MESSAGES)
    private readonly messageService: IMessageServices,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Throttle({ default: { limit: 5, ttl: 10 } })
  @Post()
  @UseInterceptors(FileFieldsInterceptor(MessageAttachmentFileFields))
  async createMessage(
    @AuthUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() { attachments }: { attachments: Attachment[] },
    @Body() { content }: CreateMessageDto,
  ) {
    if (!attachments && !content) throw new EmptyMessageException();

    const params = { user, id, content, attachments };

    const response = await this.messageService.createMessage(params);

    this.eventEmitter.emit('message.create', response);
    return;
  }

  @Get()
  @SkipThrottle()
  async getMessagesByid(
    @Param('id', ParseIntPipe) id: number,
    @Query('skip', new DefaultValuePipe(1), ParseIntPipe) skip: number,
  ) {
    const res = await this.messageService.getMessageByid(id);
    return { id, messages: res };
  }

  // api/conversations/:id/messages/:messageId
  @Delete('/:messageId')
  async deleteMessageFromConversation(
    @AuthUser() { id: userId }: User,
    @Param('id', ParseIntPipe) id: number,
    @Param('messageId', ParseIntPipe) messageId: number,
  ) {
    const params = { userId, id, messageId };
    const message = await this.messageService.deleteMessage(params);

    this.eventEmitter.emit('message.delete', { userId, message });

    return { id, messageId };
  }

  // api/conversations/:id/messages/:messageId
  @Patch('/:messageId')
  async editMessage(
    @AuthUser() { id: userId }: User,
    @Param('id', ParseIntPipe) id: number,
    @Param('messageId', ParseIntPipe) messageId: number,
    @Body() { content }: EditMessageDto,
  ): Promise<Message> {
    const params = { userId, id, messageId, content };

    const message = await this.messageService.editMessage(params);

    this.eventEmitter.emit('message.edit', message);
    return message;
  }
}
