import { HttpException, HttpStatus } from '@nestjs/common';

export class FriendRequestPendingException extends HttpException {
  constructor() {
    super('Friend Requesting Pending', HttpStatus.BAD_REQUEST);
  }
}
