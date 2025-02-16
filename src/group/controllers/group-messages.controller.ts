import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateMessageDto } from 'src/messages/dtos/CreateMessageDto';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { User } from 'src/utils/typeorm';
import { CreateGroupMessageResponse } from 'src/utils/types';
import { IGroupMessageServices } from '../interfaces/group-messages';
import { EditGroupMessageDto } from '../dtos/EditGroupMessage.dto';

@Controller(Routes.GROUPS_MESSAGES)
export class GroupMessageController {
  constructor(
    @Inject(Services.GROUPS_MESSAGES)
    private readonly groupMessageServices: IGroupMessageServices,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  async createGroupMessage(
    @AuthUser() user: User,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() { content }: CreateMessageDto,
  ): Promise<CreateGroupMessageResponse> {
    const params = { groupId, user, content };

    //
    const response = await this.groupMessageServices.createGroupMessage(params);

    this.eventEmitter.emit('group.message.create', response);
    return;
  }

  @Get()
  async getGroupMessagesById(@Param('groupId', ParseIntPipe) groupId: number) {
    const messages =
      await this.groupMessageServices.getGroupMessagesById(groupId);

    return { id: groupId, messages };
  }

  // api/groups/:groupId/messages/:messageId
  @Delete(':messageId')
  async deleteGroupMessageByMessageId(
    @AuthUser() { id: userId }: User,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
  ) {
    const params = { userId, groupId, messageId };

    const message = await this.groupMessageServices.deleteGroupMessage(params);

    this.eventEmitter.emit('group.message.delete', { userId, message });
    return { groupId, messageId };
  }

  // api/groups/:groupId/messages/:messageId
  @Patch('/:messageId')
  async editGroupMessageByMessageId(
    @AuthUser() { id: userId }: User,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
    @Body() { content }: EditGroupMessageDto,
  ) {
    const params = { userId, groupId, messageId, content };

    const message = await this.groupMessageServices.editMessage(params);

    this.eventEmitter.emit('message.group.edit', message);

    return message;
  }
}
