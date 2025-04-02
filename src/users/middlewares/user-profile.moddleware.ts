import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Services } from 'src/utils/constants';
import { IuserServices } from '../interfaces/user';
import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from 'src/utils/types';

@Injectable()
export class UserProfileMiddleware implements NestMiddleware {
  constructor(
    @Inject(Services.USERS)
    private readonly userservices: IuserServices,
  ) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    if (req.session && req.session) {
    }
  }
}
