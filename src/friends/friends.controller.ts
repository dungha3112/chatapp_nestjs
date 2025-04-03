import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Routes, ServerEvents, Services } from 'src/utils/constants';
import { IFriendsServices } from './friends';
import { AuthUser } from 'src/utils/decorators';
import { Friend, User } from 'src/utils/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SkipThrottle } from '@nestjs/throttler';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';

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

  @Get('search')
  @UseGuards(AuthenticatedGuard)
  searchUsers(@Query('query') query: string) {
    if (!query)
      throw new HttpException('Provide a valid query', HttpStatus.BAD_REQUEST);

    return this.friendServices.searchUsers(query);
  }

  @Delete(':id/delete')
  async deleteFriend(
    @AuthUser() { id: userId }: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Friend> {
    const params = { userId, id };
    const friend = await this.friendServices.deleteFriend(params);
    this.eventEmitter.emit(ServerEvents.FRIEND_REMOVED, { userId, friend });

    return friend;
  }
}
