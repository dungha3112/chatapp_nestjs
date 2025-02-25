import { HttpException, HttpStatus } from '@nestjs/common';

export class ConversationInvalidException extends HttpException {
  constructor() {
    super('Invalid conversation id.', HttpStatus.BAD_REQUEST);
  }
}
