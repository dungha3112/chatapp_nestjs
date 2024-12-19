import { Message } from 'src/utils/typeorm';
import {
  CreateMessageParams,
  CreateMessageResponse,
  DeleteMessageParams,
  EditMessageParams,
} from 'src/utils/types';

export interface IMessageServices {
  createMessage(params: CreateMessageParams): Promise<CreateMessageResponse>;

  getMessageByConversationId(id: number): Promise<Message[]>;

  deleteMessage(params: DeleteMessageParams);

  editMessage(params: EditMessageParams): Promise<Message>;
}
