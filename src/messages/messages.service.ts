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
  EditMessageParams,
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
  async deleteMessage(params: DeleteMessageParams) {
    const { conversationId, messageId, userId } = params;
    const msgParams = { id: conversationId, limit: 5 };

    const conversation =
      await this.conversationsServices.getMessages(msgParams);

    const message = await this.messageRepository.findOne({
      where: { id: messageId, author: { id: userId } },
      relations: ['conversation', 'author'],
    });

    if (!message)
      throw new HttpException(
        'Message not found or you can not delete',
        HttpStatus.BAD_REQUEST,
      );

    if (conversation.lastMessageSent.id !== message.id) {
      await this.messageRepository.delete({ id: message.id });
    } else {
      await this.deleteLastMessage(conversation, message);
    }
    return message;
  }

  async deleteLastMessage(conversation: Conversation, message: Message) {
    const size = conversation.messages.length;
    const SECOND_MESSAGE_INDEX = 1;

    if (size <= 1) {
      console.log('Last Message Sent is deleted');
      await this.conversationsServices.update({
        id: conversation.id,
        lastMessageSent: null,
      });
      return this.messageRepository.delete({ id: message.id });
    } else {
      console.log('There are more than 1 message');
      const newLastMessage = conversation.messages[SECOND_MESSAGE_INDEX];
      await this.conversationsServices.update({
        id: conversation.id,
        lastMessageSent: newLastMessage,
      });

      return this.messageRepository.delete({ id: message.id });
    }
  }

  async editMessage(params: EditMessageParams): Promise<Message> {
    const { content, conversationId, messageId, userId } = params;

    const messageDb = await this.messageRepository.findOne({
      where: {
        id: messageId,
        conversation: { id: conversationId },
        author: { id: userId },
      },
      relations: [
        'conversation',
        'conversation.creator',
        'conversation.recipient',
        'author',
      ],
    });

    if (!messageDb)
      throw new HttpException(
        'Message not found or you can not edit message',
        HttpStatus.BAD_REQUEST,
      );

    messageDb.content = content;
    return await this.messageRepository.save(messageDb);
  }
}
