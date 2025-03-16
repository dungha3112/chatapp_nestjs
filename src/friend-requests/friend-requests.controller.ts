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
import { Routes, ServerEvents, Services } from 'src/utils/constants';
import { IFriendRequestServices } from './friend-requests';
import { AuthUser } from 'src/utils/decorators';
import { User } from 'src/utils/typeorm';
import { CreateFriendDto } from './dtos/CreateFriend.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FriendRequestAcceptPayload } from 'src/utils/types';

@Controller(Routes.FRIENDS_REQUESTS)
export class FriendRequestController {
  constructor(
    @Inject(Services.FRIENDS_REQUESTS)
    private readonly friendRequestServices: IFriendRequestServices,

    private readonly eventEmitter: EventEmitter2,
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
    this.eventEmitter.emit(ServerEvents.FRIEND_REQUEST_CREATE, res);
    return res;
  }

  @Patch(':id/accept')
  async acceptFriendRequest(
    @AuthUser() { id: userId }: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FriendRequestAcceptPayload> {
    const params = { id, userId };
    const res = await this.friendRequestServices.accept(params);
    this.eventEmitter.emit(ServerEvents.FRIEND_REQUEST_ACCEPT, res.friend);

    return res;
  }

  // receiver cancel
  @Delete(':id/cancel')
  async cancelFriendRequest(
    @AuthUser() { id: userId }: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const params = { id, userId };
    const res = await this.friendRequestServices.cancel(params);
    this.eventEmitter.emit(ServerEvents.FRIEND_REQUEST_CANCEL, res);
    return res;
  }

  @Patch(':id/reject')
  async rejectFriendRequest(
    @AuthUser() { id: userId }: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const params = { id, userId };
    const res = await this.friendRequestServices.reject(params);
    this.eventEmitter.emit(ServerEvents.FRIEND_REQUEST_REJECT, res);

    return res;
  }
}
