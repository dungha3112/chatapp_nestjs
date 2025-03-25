import { Controller, Get, Inject, Param, ParseIntPipe } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IConversationsServices } from 'src/conversations/conversations';
import { UserNotFoundException } from 'src/users/exceptions/UserNotFound';
import { IuserServices } from 'src/users/interfaces/user';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { Conversation, User } from 'src/utils/typeorm';

@Controller(Routes.EXISTS)
export class ExistsController {
  constructor(
    @Inject(Services.CONVERSATIONS)
    private readonly conversationServices: IConversationsServices,

    @Inject(Services.USERS) private readonly userServices: IuserServices,

    private readonly events: EventEmitter2,
  ) {}

  @Get('conversations/:recipientId')
  async checkConversationExists(
    @AuthUser() user: User,
    @Param('recipientId', ParseIntPipe) recipientId: number,
  ): Promise<Conversation> {
    const recipient = await this.userServices.findUser({ id: recipientId });
    if (!recipient) throw new UserNotFoundException();

    const existsConversation = await this.conversationServices.isCreated(
      user.id,
      recipientId,
    );

    if (existsConversation) return existsConversation;

    const newConversation = await this.conversationServices.createConversation(
      user,
      { username: recipient.username, message: 'Hello' },
    );

    this.events.emit('conversation.create', newConversation);
    return newConversation;
  }
}
