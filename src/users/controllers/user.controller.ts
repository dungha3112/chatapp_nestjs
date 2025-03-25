import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Routes, Services } from 'src/utils/constants';
import { IuserServices } from '../interfaces/user';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import { UserAlreadyExists } from '../exceptions/UserAlreadyExists';

@Controller(Routes.USERS)
export class UsersController {
  constructor(
    @Inject(Services.USERS) private readonly userServices: IuserServices,
  ) {}

  @Get('search')
  @UseGuards(AuthenticatedGuard)
  searchUsers(@Query('query') query: string) {
    if (!query)
      throw new HttpException('Provide a valid query', HttpStatus.BAD_REQUEST);

    return this.userServices.searchUsers(query);
  }

  @Post('check')
  async checkUsername(@Query('username') username: string) {
    if (!username)
      throw new HttpException('Invalid Query', HttpStatus.BAD_REQUEST);
    const user = await this.userServices.findUser({ username });
    if (user) throw new UserAlreadyExists();
    return HttpStatus.OK;
  }
}
