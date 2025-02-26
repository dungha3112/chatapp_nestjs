import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { Conversation, User } from 'src/utils/typeorm';
import { IConversationsServices } from './conversations';
import { CreateConversationDto } from './dtos/CreateConversation.dto';

// @UseGuards(AuthenticatedGuard)
@Controller(Routes.CONVERSATIONS)
export class ConversationsController {
  constructor(
    @Inject(Services.CONVERSATIONS)
    private readonly conversationServices: IConversationsServices,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  async createConversation(
    @AuthUser() creator: User,
    @Body() conversationParams: CreateConversationDto,
  ): Promise<Conversation> {
    const conversation = await this.conversationServices.createConversation(
      creator,
      conversationParams,
    );

    this.eventEmitter.emit('conversation.create', conversation);

    return conversation;
  }

  @Get()
  async getConversations(@AuthUser() user: User): Promise<Conversation[]> {
    const conversations = await this.conversationServices.getConversations(
      user.id,
    );

    return conversations;
  }

  @Get(':conversationId')
  async findById(
    @Param('conversationId', ParseIntPipe) conversationId: number,
  ) {
    console.log(`get conversation by id ...`);

    return await this.conversationServices.findById(conversationId);
  }
}
