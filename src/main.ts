import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import 'reflect-metadata';
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  const { PORT, COOKIE_SERCET } = process.env;

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());

  app.use(
    session({
      secret: COOKIE_SERCET,
      saveUninitialized: true,
      resave: false,
      cookie: {
        maxAge: 8640000, // 1day
      },
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
