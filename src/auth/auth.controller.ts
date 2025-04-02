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
import { instanceToPlain } from 'class-transformer';
import { Response } from 'express';
import { ISessionServices } from 'src/sessions/sessions';
import { IuserServices } from 'src/users/interfaces/user';
import { Routes, Services } from 'src/utils/constants';
import { AuthenticatedRequest } from 'src/utils/types';
import { CreateUserDto } from './dtos/CreateUser.dto';
import { AuthenticatedGuard, LocalAuthGuard } from './utils/Guards';

@Controller(Routes.AUTH)
export class AuthController {
  constructor(
    @Inject(Services.USERS) private readonly userService: IuserServices,
    @Inject(Services.SESSION)
    private readonly sessionService: ISessionServices,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return instanceToPlain(await this.userService.createUser(createUserDto));
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    await this.sessionService.deleteOldSessionsByUserId(req.user.id);

    return res.sendStatus(HttpStatus.OK);
  }

  @Get('status')
  @UseGuards(AuthenticatedGuard)
  async status(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    // async status(@Res() res: Response, @Req() req: Request) {

    const sessionId = req.session.id;
    const session = await this.sessionService.updateSessionExpiredAt(sessionId);

    req.session.cookie.maxAge = session.expiredAt;
    req.session.save();

    const user = JSON.parse(session.json).passport.user;

    return res.send(user);
  }

  @Post('logout')
  @UseGuards(AuthenticatedGuard)
  async logout(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    const sessionId = req.session.id;

    req.logout((err) => {
      if (err) {
        console.log(`err logout`, err);
        return res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
      }

      req.session.destroy(async (err) => {
        if (err) {
          console.log(`error destroy session`, err);
          return res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        await this.sessionService.userLogout(sessionId);
        res.clearCookie('CHAT_APP_SESSION_ID');
        res.sendStatus(HttpStatus.OK);
      });
    });
  }
}
