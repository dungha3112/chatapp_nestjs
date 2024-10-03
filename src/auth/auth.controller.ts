import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { CreateUserDto } from './dtos/CreateUser.dto';
import { Routes, Services } from 'src/utils/constants';
import { IuserServices } from 'src/users/user';

@Controller(Routes.AUTH)
export class AuthController {
  constructor(
    @Inject(Services.USERS) private readonly userService: IuserServices,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    this.userService.createUser(createUserDto);
  }

  @Post('login')
  async login() {}

  @Get('status')
  async getStatus() {}

  @Post('logout')
  async logout() {}
}
