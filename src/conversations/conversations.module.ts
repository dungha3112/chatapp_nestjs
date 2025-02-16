import { Module } from '@nestjs/common';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { Services } from 'src/utils/constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation, Message } from 'src/utils/typeorm';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Message]), UsersModule],
  controllers: [ConversationsController],
  providers: [
    { provide: Services.CONVERSATIONS, useClass: ConversationsService },
  ],

  exports: [
    { provide: Services.CONVERSATIONS, useClass: ConversationsService },
  ],
})
export class ConversationsModule {}
