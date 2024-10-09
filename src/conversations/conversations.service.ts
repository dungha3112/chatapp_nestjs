import { Injectable } from '@nestjs/common';
import { IConversationsServices } from './conversations';
import { CreateConversationsParams } from 'src/utils/types';

@Injectable()
export class ConversationsService implements IConversationsServices {
  createConversation(conversationsParams: CreateConversationsParams) {
    throw new Error('Method not implemented.');
  }
}
