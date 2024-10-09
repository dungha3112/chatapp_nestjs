import { CreateConversationsParams } from 'src/utils/types';

export interface IConversationsServices {
  createConversation(conversationsParams: CreateConversationsParams);
}
