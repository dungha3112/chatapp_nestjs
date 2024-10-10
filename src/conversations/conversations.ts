import { Conversation, User } from 'src/utils/typeorm';
import { CreateConversationsParams } from 'src/utils/types';

export interface IConversationsServices {
  createConversation(
    creator: User,
    conversationsParams: CreateConversationsParams,
  ): Promise<Conversation>;

  getConversations(id: number): Promise<Conversation[]>;
}
