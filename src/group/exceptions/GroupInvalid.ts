import { HttpException, HttpStatus } from '@nestjs/common';

export class GroupInvalidException extends HttpException {
  constructor() {
    super('Group Invalid', HttpStatus.BAD_REQUEST);
  }
}
