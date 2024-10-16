import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import { IConversationsServices } from 'src/conversations/conversations';
import { Services } from 'src/utils/constants';
import { Conversation, Message } from 'src/utils/typeorm';
import { CreateMessageParams } from 'src/utils/types';
import { Repository } from 'typeorm';
import { IMessageServices } from './messages';

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

    if (creator.id !== user.id && recipient.id !== user.id)
      throw new HttpException(
        'You are neither creator nor recipient of the conversation',
        HttpStatus.FORBIDDEN,
      );

    const newMessage = this.messageRepository.create({
      author: instanceToPlain(user),
      content,
      conversation,
    });

    const savedMessage = await this.messageRepository.save(newMessage);

    conversation.lastMessageSent = { id: savedMessage.id } as Message;

    const updateConversation =
      await this.conversationsServices.save(conversation);

    return { message: savedMessage, conversation: updateConversation };
  }

  async getMessageByConversationId(id: number): Promise<Message[]> {
    const conversation = await this.conversationsServices.findById(id);

    const messages = await this.messageRepository.find({
      where: { conversation: { id: id } },
      relations: ['author'],
    });

    return messages;
  }
}
