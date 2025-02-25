import * as bcrypt from 'bcrypt';
import { AuthenticatedRequest } from './types';
import { NextFunction, Response } from 'express';
import { HttpException, HttpStatus } from '@nestjs/common';

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt();
  return await bcrypt.hash(password, salt);
};

export async function compareHash(rawPassword: string, hashedPassword: string) {
  return await bcrypt.compare(rawPassword, hashedPassword);
}

export const isAuthorized = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  console.log(`is authorized`);

  try {
    if (req.user) {
      next();
    } else {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  } catch (error) {
    console.log('error authorized: ', error);
    return next(error);
  }
};
