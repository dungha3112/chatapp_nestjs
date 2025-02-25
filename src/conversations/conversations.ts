import { Conversation, User } from 'src/utils/typeorm';
import {
  AccessParams,
  CreateConversationsParams,
  GetConversationMessagesParams,
  UpdateConversationParams,
} from 'src/utils/types';

export interface IConversationsServices {
  createConversation(
    creator: User,
    conversationsParams: CreateConversationsParams,
  ): Promise<Conversation>;

  getConversations(id: number): Promise<Conversation[]>;

  findById(id: number);

  save(conversation: Conversation): Promise<Conversation>;

  getMessages(params: GetConversationMessagesParams): Promise<Conversation>;

  update(params: UpdateConversationParams);

  hasAccess(params: AccessParams);
}
