import { IoAdapter } from '@nestjs/platform-socket.io';
import * as cookie from 'cookie';
import { ServerOptions } from 'socket.io';
import * as cookieParser from 'cookie-parser';
import { AuthenticatedSocket } from 'src/utils/interfaces';
import { AppDataSource, Session, User } from 'src/utils/typeorm';
import { plainToInstance } from 'class-transformer';
import * as dotenv from 'dotenv';
dotenv.config();

export class WebsocketAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions) {
    const sessionRepository = AppDataSource.getRepository(Session);

    const server = super.createIOServer(port, options);

    server.use(async (socket: AuthenticatedSocket, next) => {
      const { cookie: cookieClient } = socket.handshake.headers;

      if (!cookieClient) {
        console.log('Client has no cookies');
        return next(new Error('Not Authenticated'));
      }

      const { CHAT_APP_SESSION_ID } = cookie.parse(cookieClient);
      if (!CHAT_APP_SESSION_ID) {
        console.log('CHAT_APP_SESSION_ID DOES NOT EXIST');
        return next(new Error('Not Authenticated'));
      }

      const signedCookie = cookieParser.signedCookie(
        CHAT_APP_SESSION_ID,
        process.env.COOKIE_SECRET,
      );

      if (!signedCookie) {
        console.log('Error signing cookie.');
        return next(new Error('Error signing cookie.'));
      }

      const sessionDB = await sessionRepository.findOne({
        where: { id: signedCookie },
      });

      if (!sessionDB) {
        console.log('No session found');
        return next(new Error('No session found'));
      }

      const userFromJson = JSON.parse(sessionDB.json);

      if (!userFromJson.passport || !userFromJson.passport.user) {
        console.log('Passport or User object does not exist.');
        return next(new Error('Passport or User object does not exist.'));
      }

      const userDB = plainToInstance(
        User,
        JSON.parse(sessionDB.json).passport.user,
      );

      socket.user = userDB;

      next();
    });

    return server;
  }
}
