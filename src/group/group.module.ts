import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { Services } from 'src/utils/constants';
import { Group, GroupMessage } from 'src/utils/typeorm';
import { GroupMessageController } from './controllers/group-messages.controller';
import { GroupController } from './controllers/group.controller';
import { GroupMessageServices } from './services/group-messages.service';
import { GroupService } from './services/group.service';

@Module({
  imports: [TypeOrmModule.forFeature([Group, GroupMessage]), UsersModule],
  controllers: [GroupController, GroupMessageController],
  providers: [
    { provide: Services.GROUPS, useClass: GroupService },
    { provide: Services.GROUPS_MESSAGES, useClass: GroupMessageServices },
  ],

  exports: [{ provide: Services.GROUPS, useClass: GroupService }],
})
export class GroupModule {}
