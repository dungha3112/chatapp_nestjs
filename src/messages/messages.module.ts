import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { Services } from 'src/utils/constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation, Message } from 'src/utils/typeorm';
import { ConversationsModule } from 'src/conversations/conversations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Conversation]),
    ConversationsModule,
  ],
  controllers: [MessagesController],
  providers: [
    {
      provide: Services.MESSAGES,
      useClass: MessagesService,
    },
  ],
})
export class MessagesModule {}
