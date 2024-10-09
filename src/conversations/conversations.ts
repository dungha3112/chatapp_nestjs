import { Conversation } from 'src/utils/typeorm';
import { CreateConversationsParams } from 'src/utils/types';

export interface IConversationsServices {
  createConversation(
    conversationsParams: CreateConversationsParams,
  ): Promise<Conversation>;
}
