import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/CreateUser.dto';
import { Routes, Services } from 'src/utils/constants';
import { IuserServices } from 'src/users/user';
import { instanceToPlain } from 'class-transformer';
import { LocalAuthGuard } from './utils/Guards';
import { Response } from 'express';

@Controller(Routes.AUTH)
export class AuthController {
  constructor(
    @Inject(Services.USERS) private readonly userService: IuserServices,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return instanceToPlain(await this.userService.createUser(createUserDto));
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Res() res: Response) {
    return res.send(HttpStatus.OK);
  }

  @Get('status')
  async getStatus() {}

  @Post('logout')
  async logout() {}
}
