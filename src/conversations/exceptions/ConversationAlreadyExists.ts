import { HttpException, HttpStatus } from '@nestjs/common';

export class ConversationAlreadlyExists extends HttpException {
  constructor() {
    super('Conversation already exists', HttpStatus.BAD_REQUEST);
  }
}
