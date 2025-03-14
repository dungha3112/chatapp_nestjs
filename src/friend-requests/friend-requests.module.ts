import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friend, FriendRequest } from 'src/utils/typeorm';
import { FriendRequestController } from './friend-requests.controller';
import { Services } from 'src/utils/constants';
import { FriendRequestServices } from './friend-requests.service';
import { FriendsModule } from 'src/friends/friends.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Friend, FriendRequest]),
    UsersModule,
    FriendsModule,
  ],
  controllers: [FriendRequestController],
  providers: [
    {
      provide: Services.FRIENDS_REQUESTS,
      useClass: FriendRequestServices,
    },
  ],

  exports: [
    {
      provide: Services.FRIENDS_REQUESTS,
      useClass: FriendRequestServices,
    },
  ],
})
export class FriendRequestsModule {}
