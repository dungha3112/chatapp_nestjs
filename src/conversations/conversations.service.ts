import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation, Message, User } from 'src/utils/typeorm';
import { CreateConversationsParams } from 'src/utils/types';
import { Repository } from 'typeorm';
import { IConversationsServices } from './conversations';
import { Services } from 'src/utils/constants';
import { IuserServices } from 'src/users/user';

@Injectable()
export class ConversationsService implements IConversationsServices {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,

    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,

    @Inject(Services.USERS) private readonly userServices: IuserServices,
  ) {}

  async getConversations(id: number): Promise<Conversation[]> {
    const conversations = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.lastMessageSent', 'lastMessageSent')
      .leftJoinAndSelect('conversation.creator', 'creator')
      .leftJoinAndSelect('conversation.recipient', 'recipient')
      .where('creator.id = :id', { id })
      .orWhere('recipient.id = :id', { id })
      .orderBy('conversation.lastMessageSentAt', 'DESC')
      .getMany();

    return conversations;
  }

  async createConversation(
    creator: User,
    conversationsParams: CreateConversationsParams,
  ): Promise<Conversation> {
    const { email, message: content } = conversationsParams;
    const recipient = await this.userServices.findUser({ email });

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

    const conversationExists = await this.conversationRepository.findOne({
      where: [
        { creator: { id: creator.id }, recipient: { id: recipient.id } },
        { creator: { id: recipient.id }, recipient: { id: creator.id } },
      ],
    });

    if (conversationExists)
      throw new HttpException(
        'Conversation already exists',
        HttpStatus.BAD_REQUEST,
      );

    const newConversation = await this.conversationRepository.create({
      creator,
      recipient,
    });

    const saveConversation =
      await this.conversationRepository.save(newConversation);

    /**
     * create and save message
     */
    const newMessage = await this.messageRepository.create({
      content,
      conversation: saveConversation,
      author: creator,
    });
    const saveMessage = await this.messageRepository.save(newMessage);

    /**
     * update last message sent
     */
    saveConversation.lastMessageSent = saveMessage;
    const updateConversation =
      await this.conversationRepository.save(saveConversation);

    return updateConversation;
  }

  async findById(id: number): Promise<Conversation | undefined> {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: ['creator', 'recipient', 'lastMessageSent'],
    });

    if (!conversation)
      throw new HttpException('Conversation not found', HttpStatus.BAD_REQUEST);

    return conversation;
  }

  async save(conversation: Conversation): Promise<Conversation> {
    return await this.conversationRepository.save(conversation);
  }
}
