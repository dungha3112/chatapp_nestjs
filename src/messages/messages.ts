import { Conversation, Message } from 'src/utils/typeorm';
import { CreateMessageParams } from 'src/utils/types';

export interface IMessageServices {
  createMessage(
    params: CreateMessageParams,
  ): Promise<{ message: Message; conversation: Conversation }>;

  getMessageByConversationId(id: number): Promise<Message[]>;
}
