import { HttpException, HttpStatus } from '@nestjs/common';

export class FriendRequestRejectedException extends HttpException {
  constructor() {
    super('Friend Requesting Rejected', HttpStatus.BAD_REQUEST);
  }
}
