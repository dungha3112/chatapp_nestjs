import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { TypeormStore } from 'connect-typeorm';
import * as session from 'express-session';
import * as passport from 'passport';
import 'reflect-metadata';
import { AppModule } from './app.module';
import { AppDataSource, Session } from './utils/typeorm';

async function bootstrap() {
  const { PORT, COOKIE_SERCET } = process.env;
  await AppDataSource.initialize();
  const app = await NestFactory.create(AppModule);

  const sessionRepository = AppDataSource.getRepository(Session);

  app.setGlobalPrefix('api');
  app.enableCors({ origin: ['http://localhost:5173'], credentials: true });
  app.useGlobalPipes(new ValidationPipe());
  app.use(
    session({
      secret: COOKIE_SERCET,
      saveUninitialized: true,
      resave: false,
      cookie: {
        maxAge: 8640000, // 1day
      },
      store: new TypeormStore().connect(sessionRepository),
    }),
  );

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
