import {
  Body,
  Controller,
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
    const message = await this.messageService.createMessage(params);
  }
}
