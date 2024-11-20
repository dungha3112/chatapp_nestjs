import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import { IConversationsServices } from 'src/conversations/conversations';
import { Services } from 'src/utils/constants';
import { Conversation, Message } from 'src/utils/typeorm';
import {
  CreateMessageParams,
  CreateMessageResponse,
  DeleteMessageParams,
  DeleteMessageResponse,
} from 'src/utils/types';
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

  /**
   * createMessage
   * @param params
   * @returns
   */
  async createMessage(
    params: CreateMessageParams,
  ): Promise<CreateMessageResponse> {
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

    delete savedMessage.conversation;

    return {
      message: savedMessage,
      conversation: { ...updateConversation, lastMessageSent: savedMessage },
    };
  }

  /**
   * // getMessageByConversationId
   * @param id
   * @returns
   */
  async getMessageByConversationId(id: number): Promise<Message[]> {
    const conversation = await this.conversationsServices.findById(id);

    const messages = await this.messageRepository.find({
      where: { conversation: { id: id } },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });

    return messages;
  }

  /**
   * delete message
   * @param params
   */
  async deleteMessage(
    params: DeleteMessageParams,
  ): Promise<DeleteMessageResponse> {
    const { conversationId, messageId, userId } = params;

    const conversation =
      await this.conversationsServices.findById(conversationId);

    const message = await this.messageRepository.findOne({
      where: {
        id: messageId,
        author: { id: userId },
        conversation: { id: conversationId },
      },
    });

    if (!message) {
      throw new HttpException(
        "Message not found or can't delete message",
        HttpStatus.BAD_REQUEST,
      );
    }
    if (conversation.lastMessageSent.id !== message.id) {
      await this.messageRepository.delete({ id: messageId });
    }

    const messagesConversation = await this.messageRepository.find({
      where: { conversation: { id: conversationId } },
      order: { id: 'DESC' },
      take: 2,
      relations: ['author'],
    });

    /*
     *  order: { id: 'DESC' } => lastMessage =messagesConversation[0];
     * => newLastMessage = messagesConversation[1]
     */
    const lastMessage = messagesConversation.at(0);
    const newLastMessage = messagesConversation.at(1);

    // deleting lastmessage
    if (conversation.lastMessageSent === null) {
      conversation.lastMessageSent = null;
      await this.conversationsServices.save(conversation);
      await this.messageRepository.delete({ id: messageId });
    } else {
      conversation.lastMessageSent = { id: newLastMessage.id } as Message;

      await this.conversationsServices.save(conversation);
      await this.messageRepository.delete({ id: lastMessage.id });
    }

    return {
      conversation: { ...conversation, lastMessageSent: newLastMessage },
      message: newLastMessage,
    };
  }
}
