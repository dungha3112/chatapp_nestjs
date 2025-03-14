import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Services } from 'src/utils/constants';
import { Friend, FriendRequest } from 'src/utils/typeorm';
import { FriendsController } from './friends.controller';
import { FriendsServices } from './friends.service';

@Module({
  imports: [TypeOrmModule.forFeature([Friend, FriendRequest])],
  controllers: [FriendsController],
  providers: [
    {
      provide: Services.FRIENDS,
      useClass: FriendsServices,
    },
  ],
  exports: [
    {
      provide: Services.FRIENDS,
      useClass: FriendsServices,
    },
  ],
})
export class FriendsModule {}
