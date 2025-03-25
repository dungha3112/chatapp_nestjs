import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/CreateUser.dto';
import { Routes, Services } from 'src/utils/constants';
import { IuserServices } from 'src/users/interfaces/user';
import { instanceToPlain } from 'class-transformer';
import { AuthenticatedGuard, LocalAuthGuard } from './utils/Guards';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from 'src/utils/types';

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
  async login(@Res() res: Response, @Req() req: Request) {
    return res.sendStatus(HttpStatus.OK);
  }

  @UseGuards(AuthenticatedGuard)
  @Get('status')
  async status(@Res() res: Response, @Req() req: AuthenticatedRequest) {


    return res.send(instanceToPlain(req.user));
  }

  @Post('logout')
  async logout() {}
}
