import { Inject, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { Services } from 'src/utils/constants';
import { AuthenticatedRequest } from 'src/utils/types';
import { IConversationsServices } from '../conversations';
import { ConversationInvalidException } from '../exceptions/ConversationInvalid';
import { ConversationNotFoundException } from '../exceptions/ConversationNotFound';

export class ConversationMiddleware implements NestMiddleware {
  constructor(
    @Inject(Services.CONVERSATIONS)
    private readonly conversationsServices: IConversationsServices,
  ) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    console.log('middleware in conversation...');

    const { id: userId } = req.user;
    const conversationId = parseInt(req.params.conversationId);

    if (isNaN(conversationId)) throw new ConversationInvalidException();

    const isReadable = await this.conversationsServices.hasAccess({
      conversationId,
      userId,
    });

    if (isReadable) {
      next();
    } else {
      throw new ConversationNotFoundException();
    }
  }
}
