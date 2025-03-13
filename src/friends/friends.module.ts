import { Module } from '@nestjs/common';
import { Services } from 'src/utils/constants';
import { FriendsServices } from './friends.service';
import { FriendsController } from './friends.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friend } from 'src/utils/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Friend])],
  controllers: [FriendsController],
  providers: [{ provide: Services.FRIENDS, useClass: FriendsServices }],
  exports: [{ provide: Services.FRIENDS, useClass: FriendsServices }],
})
export class FriendsModule {}
