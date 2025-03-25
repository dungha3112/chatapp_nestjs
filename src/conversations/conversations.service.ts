import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IuserServices } from 'src/users/interfaces/user';
import { Services } from 'src/utils/constants';
import { Conversation, Message, User } from 'src/utils/typeorm';
import {
  AccessConversationParams,
  CreateConversationsParams,
  GetConversationMessagesParams,
  UpdateConversationParams,
} from 'src/utils/types';
import { Repository } from 'typeorm';
import { IConversationsServices } from './conversations';
import { ConversationAlreadlyExists } from './exceptions/ConversationAlreadyExists';
import { ConversationNotFoundException } from './exceptions/ConversationNotFound';

@Injectable()
export class ConversationsService implements IConversationsServices {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,

    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,

    @Inject(Services.USERS) private readonly userServices: IuserServices,
  ) {}

  /**
   * getConversations
   * @param id
   * @returns
   */
  async getConversations(id: number): Promise<Conversation[]> {
    const conversations = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.lastMessageSent', 'lastMessageSent')
      .leftJoinAndSelect('conversation.creator', 'creator')
      .leftJoinAndSelect('conversation.recipient', 'recipient')
      .leftJoinAndSelect('creator.profile', 'creatorProfile')
      .leftJoinAndSelect('recipient.profile', 'recipientProfile')

      .leftJoinAndSelect('lastMessageSent.author', 'author')
      .where('creator.id = :id', { id })
      .orWhere('recipient.id = :id', { id })
      .orderBy('conversation.lastMessageSentAt', 'DESC')
      .getMany();

    return conversations;
  }

  /**
   * createConversation
   * @param creator
   * @param conversationsParams
   * @returns
   */
  async createConversation(
    creator: User,
    conversationsParams: CreateConversationsParams,
  ): Promise<Conversation> {
    const { username, message: content } = conversationsParams;
    const recipient = await this.userServices.findUser({ username });

    if (!recipient) {
      throw new HttpException(
        'The recipient not found.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (creator.id === recipient.id) {
      throw new HttpException(
        'You can not create conversation with myself.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existsConversation = await this.isCreated(creator.id, recipient.id);

    if (existsConversation) throw new ConversationAlreadlyExists();

    const newConversation = this.conversationRepository.create({
      creator,
      recipient,
    });

    const savedConversation =
      await this.conversationRepository.save(newConversation);

    // create and save message
    const newMessage = this.messageRepository.create({
      content,
      conversation: savedConversation,
      author: creator,
    });

    const saveMessage = await this.messageRepository.save(newMessage);

    // update last message sent
    savedConversation.lastMessageSent = saveMessage;

    const updateConversation =
      await this.conversationRepository.save(savedConversation);

    return updateConversation;
  }

  async isCreated(
    creatorId: number,
    recipientId: number,
  ): Promise<Conversation | undefined> {
    return await this.conversationRepository.findOne({
      where: [
        { creator: { id: creatorId }, recipient: { id: recipientId } },
        { creator: { id: recipientId }, recipient: { id: creatorId } },
      ],
    });
  }

  /**
   * findById
   * @param id
   * @returns
   */
  async findById(id: number) {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: [
        'creator',
        'recipient',
        'lastMessageSent',
        'lastMessageSent.author',
        'creator.profile',
        'recipient.profile',
      ],
    });

    return conversation;
  }

  /**
   * // save conversation
   * @param conversation
   * @returns
   */
  async save(conversation: Conversation): Promise<Conversation> {
    const conver = await this.conversationRepository.save(conversation);
    return conver;
  }

  /**
   * getMessages
   * @param param
   * @returns
   */

  async getMessages({
    id,
    limit,
  }: GetConversationMessagesParams): Promise<Conversation> {
    const conversation = await this.conversationRepository
      .createQueryBuilder('conversation')
      .where('id = :id', { id })
      .leftJoinAndSelect('conversation.lastMessageSent', 'lastMessageSent')
      .leftJoinAndSelect('conversation.messages', 'message')
      .where('conversation.id = :id', { id })
      .orderBy('message.createdAt', 'DESC')
      .limit(limit)
      .getOne();

    if (!conversation)
      throw new HttpException('Conversation not found', HttpStatus.BAD_REQUEST);

    return conversation;
  }

  /**
   * update conversation
   * @param params
   */
  async update(params: UpdateConversationParams) {
    const { id, lastMessageSent } = params;

    return await this.conversationRepository.update(id, { lastMessageSent });
  }

  async hasAccess(params: AccessConversationParams) {
    const { conversationId, userId } = params;
    const conversation = await this.findById(conversationId);

    if (!conversation) throw new ConversationNotFoundException();

    return (
      (conversation.creator && conversation.creator.id === userId) ||
      (conversation.recipient && conversation.recipient.id === userId)
    );
  }
}
