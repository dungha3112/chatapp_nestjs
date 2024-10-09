import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import { Routes, Services } from 'src/utils/constants';
import { IConversationsServices } from './conversations';
import { CreateConversationDto } from './dtos/CreateConversation.dto';

@UseGuards(AuthenticatedGuard)
@Controller(Routes.CONVERSATIONS)
export class ConversationsController {
  constructor(
    @Inject(Services.CONVERSATIONS)
    private readonly conversationServices: IConversationsServices,
  ) {}

  @Post()
  async createConversation(@Body() conversationParams: CreateConversationDto) {
    return this.conversationServices.createConversation(conversationParams);
  }
}
