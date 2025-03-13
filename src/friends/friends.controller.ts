import { Controller, Get, Inject } from '@nestjs/common';
import { Routes, Services } from 'src/utils/constants';
import { IFriendsServices } from './friends';
import { AuthUser } from 'src/utils/decorators';
import { User } from 'src/utils/typeorm';

@Controller(Routes.FRIENDS)
export class FriendsController {
  constructor(
    @Inject(Services.FRIENDS) private readonly friendServices: IFriendsServices,
  ) {}

  @Get()
  getFriends(@AuthUser() user: User) {
    return this.friendServices.getFriends(user.id);
  }
}
