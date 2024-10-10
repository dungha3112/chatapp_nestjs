import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import { Routes, Services } from 'src/utils/constants';
import { IConversationsServices } from './conversations';
import { CreateConversationDto } from './dtos/CreateConversation.dto';
import { AuthUser } from 'src/utils/decorators';
import { Conversation, User } from 'src/utils/typeorm';

@UseGuards(AuthenticatedGuard)
@Controller(Routes.CONVERSATIONS)
export class ConversationsController {
  constructor(
    @Inject(Services.CONVERSATIONS)
    private readonly conversationServices: IConversationsServices,
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

    return conversation;
  }

  @Get()
  async getConversations(@AuthUser() user: User): Promise<Conversation[]> {
    const conversations = await this.conversationServices.getConversations(
      user.id,
    );

    return conversations;
  }
}
