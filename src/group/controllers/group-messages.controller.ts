import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateMessageDto } from 'src/messages/dtos/CreateMessageDto';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { GroupMessage, User } from 'src/utils/typeorm';
import { CreateGroupMessageResponse } from 'src/utils/types';
import { IGroupMessageServices } from '../interfaces/group-messages';

@Controller(Routes.GROUPS_MESSAGES)
export class GroupMessageController {
  constructor(
    @Inject(Services.GROUPS_MESSAGES)
    private readonly groupMessageServices: IGroupMessageServices,

    private readonly eventEmtiter: EventEmitter2,
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

    this.eventEmtiter.emit('group.message.create', response);
    return;
  }

  @Get()
  async getGroupMessagesById(@Param('groupId', ParseIntPipe) groupId: number) {
    const messages =
      await this.groupMessageServices.getGroupMessagesById(groupId);

    return { id: groupId, messages };
  }
}
