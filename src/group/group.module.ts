import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { Services } from 'src/utils/constants';
import { Group, GroupMessage } from 'src/utils/typeorm';
import { GroupMessageController } from './controllers/group-messages.controller';
import { GroupController } from './controllers/group.controller';
import { GroupMessageServices } from './services/group-messages.service';
import { GroupService } from './services/group.service';
import { GroupRecipientsController } from './controllers/group-recipients.controller';
import { GroupRecipientsServices } from './services/group-recipients.service';
import { isAuthorized } from 'src/utils/helpers';
import { GroupMiddleware } from './middlewares/group.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([Group, GroupMessage]), UsersModule],
  controllers: [
    GroupController,
    GroupMessageController,
    GroupRecipientsController,
  ],
  providers: [
    { provide: Services.GROUPS, useClass: GroupService },
    { provide: Services.GROUPS_MESSAGES, useClass: GroupMessageServices },
    { provide: Services.GROUPS_RECIPIENTS, useClass: GroupRecipientsServices },
  ],

  exports: [{ provide: Services.GROUPS, useClass: GroupService }],
})
export class GroupModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(isAuthorized, GroupMiddleware).forRoutes('/groups/:id');
  }
}
