import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IMessageServices } from './messages';
import { Conversation, Message } from 'src/utils/typeorm';
import { CreateMessageParams } from 'src/utils/types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Services } from 'src/utils/constants';
import { IConversationsServices } from 'src/conversations/conversations';

@Injectable()
export class MessagesService implements IMessageServices {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,

    @Inject(Services.CONVERSATIONS)
    private readonly conversationsServices: IConversationsServices,
  ) {}

  async createMessage(
    params: CreateMessageParams,
  ): Promise<{ message: Message; conversation: Conversation }> {
    const { user, conversationId, content } = params;

    const conversation =
      await this.conversationsServices.findById(conversationId);

    const { creator, recipient } = conversation;
    if (creator.id !== user.id || recipient.id !== user.id)
      throw new HttpException(
        'You are neither creator nor recipient of the conversation',
        HttpStatus.FORBIDDEN,
      );

    const newMessage = await this.messageRepository.create({
      author: user,
      content,
      conversation,
    });

    const savedMessage = await this.messageRepository.save(newMessage);

    conversation.lastMessageSent = savedMessage;
    const updateConversation =
      await this.conversationsServices.save(conversation);

    return { message: savedMessage, conversation: updateConversation };
  }
}
