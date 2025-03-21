import {
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { Routes, ServerEvents, Services } from 'src/utils/constants';
import { IFriendsServices } from './friends';
import { AuthUser } from 'src/utils/decorators';
import { Friend, User } from 'src/utils/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller(Routes.FRIENDS)
export class FriendsController {
  constructor(
    @Inject(Services.FRIENDS) private readonly friendServices: IFriendsServices,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Get()
  async getFriends(@AuthUser() user: User) {
    return await this.friendServices.getFriends(user.id);
  }

  @Delete(':id/delete')
  async deleteFriend(
    @AuthUser() { id: userId }: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Friend> {
    const params = { userId, id };
    const friend = await this.friendServices.deleteFriend(params);
    this.eventEmitter.emit(ServerEvents.FRIEND_REMOVED, { userId, friend });
    console.log({ userId, friend });

    return friend;
  }
}
