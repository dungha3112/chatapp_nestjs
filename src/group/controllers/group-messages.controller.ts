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
import { CreateMessageDto } from 'src/messages/dtos/CreateMessageDto';
import {
  MessageAttachmentFileFields,
  Routes,
  Services,
} from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { User } from 'src/utils/typeorm';
import { Attachment, CreateGroupMessageResponse } from 'src/utils/types';
import { IGroupMessageServices } from '../interfaces/group-messages';
import { EditGroupMessageDto } from '../dtos/EditGroupMessage.dto';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { EmptyMessageException } from 'src/messages/exceptions/EmptyMessage';

@Controller(Routes.GROUPS_MESSAGES)
export class GroupMessageController {
  constructor(
    @Inject(Services.GROUPS_MESSAGES)
    private readonly groupMessageServices: IGroupMessageServices,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 10 } })
  @UseInterceptors(FileFieldsInterceptor(MessageAttachmentFileFields))
  async createGroupMessage(
    @AuthUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() { attachments }: { attachments: Attachment[] },
    @Body() { content }: CreateMessageDto,
  ): Promise<CreateGroupMessageResponse> {
    if (!attachments && !content) throw new EmptyMessageException();

    const params = { user, id, content, attachments };

    //
    const response = await this.groupMessageServices.createGroupMessage(params);

    this.eventEmitter.emit('group.message.create', response);
    return;
  }

  @Get()
  @SkipThrottle()
  async getGroupMessagesById(
    @Param('id', ParseIntPipe) id: number,
    @Query('skip', new DefaultValuePipe(1), ParseIntPipe) skip: number,
  ) {
    const res = await this.groupMessageServices.getGroupMessagesById(id, skip);

    return { id, messages: res };
  }

  // api/groups/:id/messages/:messageId
  @Delete(':messageId')
  @SkipThrottle()
  async deleteGroupMessageByMessageId(
    @AuthUser() { id: userId }: User,
    @Param('id', ParseIntPipe) id: number,
    @Param('messageId', ParseIntPipe) messageId: number,
  ) {
    const params = { userId, id, messageId };

    const message = await this.groupMessageServices.deleteGroupMessage(params);

    this.eventEmitter.emit('group.message.delete', { userId, message });
    return { id, messageId };
  }

  // api/groups/:id/messages/:messageId
  @Patch('/:messageId')
  @SkipThrottle()
  async editGroupMessageByMessageId(
    @AuthUser() { id: userId }: User,
    @Param('id', ParseIntPipe) id: number,
    @Param('messageId', ParseIntPipe) messageId: number,
    @Body() { content }: EditGroupMessageDto,
  ) {
    const params = { userId, id, messageId, content };

    const message = await this.groupMessageServices.editMessage(params);

    this.eventEmitter.emit('group.message.update', message);

    return message;
  }
}
