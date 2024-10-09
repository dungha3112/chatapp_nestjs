import { Inject, Injectable } from '@nestjs/common';
import { IConversationsServices } from './conversations';
import { CreateConversationsParams } from 'src/utils/types';
import { Conversation } from 'src/utils/typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ConversationsService implements IConversationsServices {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
  ) {}

  createConversation(
    conversationsParams: CreateConversationsParams,
  ): Promise<Conversation> {
    throw new Error('Method not implemented.');
  }
}
