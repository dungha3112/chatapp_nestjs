import {
  Body,
  Controller,
  Inject,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CreateMessageDto } from 'src/messages/dtos/CreateMessageDto';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { User } from 'src/utils/typeorm';

@Controller(Routes.GROUPS_MESSAGES)
export class GroupMessageController {
  constructor(
    @Inject(Services.GROUPS_MESSAGES) private readonly groupMessageServices,
  ) {}

  @Post()
  async createGroupMessage(
    @AuthUser() user: User,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() { content }: CreateMessageDto,
  ) {
    const params = { id: groupId, userId: user.id, content };
    console.log('create group message');
  }
}
