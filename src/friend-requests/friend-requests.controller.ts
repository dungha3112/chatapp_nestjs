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
import { Routes, Services } from 'src/utils/constants';
import { IFriendRequestServices } from './friend-requests';
import { AuthUser } from 'src/utils/decorators';
import { User } from 'src/utils/typeorm';
import { CreateFriendDto } from './dtos/CreateFriend.dto';

@Controller(Routes.FRIENDS_REQUESTS)
export class FriendRequestController {
  constructor(
    @Inject(Services.FRIENDS_REQUESTS)
    private readonly friendRequestServices: IFriendRequestServices,
  ) {}

  @Get()
  async getFriendRequests(@AuthUser() { id }: User) {
    return await this.friendRequestServices.getFriendRequests(id);
  }

  @Post()
  async createFriendRequest(
    @AuthUser() sender: User,
    @Body() { email }: CreateFriendDto,
  ) {
    const res = await this.friendRequestServices.create({ sender, email });
    return res;
  }

  @Patch(':id/accept')
  async acceptFriendRequest(
    @AuthUser() { id: userId }: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const params = { id, userId };
    const res = await this.friendRequestServices.accept(params);
    return res;
  }

  // myself cancel
  @Delete(':id/cancel')
  async cancelFriendRequest(
    @AuthUser() { id: userId }: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const params = { id, userId };
    const res = await this.friendRequestServices.accept(params);
    return res;
  }

  @Patch(':id/reject')
  async rejectFriendRequest(
    @AuthUser() { id: userId }: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const params = { id, userId };
    const res = await this.friendRequestServices.reject(params);
    return res;
  }
}
