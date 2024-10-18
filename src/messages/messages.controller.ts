import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Routes, Services } from 'src/utils/constants';
import { IMessageServices } from './messages';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import { AuthUser } from 'src/utils/decorators';
import { User } from 'src/utils/typeorm';
import { CreateMessageDto } from './dtos/CreateMessageDto';

@UseGuards(AuthenticatedGuard)
@Controller(Routes.MESSAGES)
export class MessagesController {
  constructor(
    @Inject(Services.MESSAGES)
    private readonly messageService: IMessageServices,
  ) {}

  @Post()
  async createMessage(
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @AuthUser() user: User,
    @Body() { content }: CreateMessageDto,
  ) {
    const params = { user, conversationId, content };
    return await this.messageService.createMessage(params);
  }

  @Get()
  async getMessagesByConversationId(
    @Param('conversationId', ParseIntPipe) conversationId: number,
  ) {
    return await this.messageService.getMessageByConversationId(conversationId);
  }
}
