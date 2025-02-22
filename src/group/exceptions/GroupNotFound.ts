import { HttpException, HttpStatus } from '@nestjs/common';

export class GroupNotFoundException extends HttpException {
  constructor() {
    super('Group not found.', HttpStatus.BAD_REQUEST);
  }
}
