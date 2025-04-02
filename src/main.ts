import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { TypeormStore } from 'connect-typeorm';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as morgan from 'morgan';
import * as passport from 'passport';
import 'reflect-metadata';
import { AppModule } from './app.module';
import { WebsocketAdapter } from './gateway/gateway.adapter';
import { AppDataSource, Session } from './utils/typeorm';

async function bootstrap() {
  const { PORT, COOKIE_SECRET } = process.env;
  await AppDataSource.initialize();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const sessionRepository = AppDataSource.getRepository(Session);
  const adapter = new WebsocketAdapter(app);

  app.useWebSocketAdapter(adapter);
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.enableCors({ origin: ['http://localhost:5173'], credentials: true });
  app.useGlobalPipes(new ValidationPipe());

  app.set('trust proxy', 'loopback');

  app.use(
    session({
      secret: COOKIE_SECRET,
      saveUninitialized: false,
      resave: false,
      cookie: { maxAge: 86400000 },
      name: 'CHAT_APP_SESSION_ID',
      store: new TypeormStore().connect(sessionRepository),
    }),
  );
  app.use(morgan('dev'));

  app.use(passport.initialize());
  app.use(passport.session());
  try {
    await app.listen(PORT, () => {
      console.log(`--> Server is running on port: ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

bootstrap();
