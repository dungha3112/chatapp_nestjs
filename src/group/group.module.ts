import { Module } from '@nestjs/common';
import { GroupController } from './controllers/group.controller';
import { GroupService } from './services/group.service';
import { Services } from 'src/utils/constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from 'src/utils/typeorm';
import { UsersModule } from 'src/users/users.module';
import { GroupMessageController } from './controllers/group-messages.controller';
import { GroupMessageServices } from './services/group-messages.service';

@Module({
  imports: [TypeOrmModule.forFeature([Group]), UsersModule],
  controllers: [GroupController, GroupMessageController],
  providers: [
    { provide: Services.GROUPS, useClass: GroupService },
    { provide: Services.GROUPS_MESSAGES, useClass: GroupMessageServices },
  ],
})
export class GroupModule {}
