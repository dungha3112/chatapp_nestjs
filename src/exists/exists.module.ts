import { Module } from '@nestjs/common';
import { ExistsController } from './exists.controller';
import { ConversationsModule } from 'src/conversations/conversations.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [ConversationsModule, UsersModule],
  providers: [],
  controllers: [ExistsController],
})
export class ExistsModule {}
