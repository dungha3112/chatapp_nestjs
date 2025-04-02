import { Inject, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { Services } from 'src/utils/constants';
import { AuthenticatedRequest } from 'src/utils/types';
import { IGroupServices } from '../interfaces/group';
import { GroupInvalidException } from '../exceptions/GroupInvalid';
import { GroupNotFoundException } from '../exceptions/GroupNotFound';

export class GroupMiddleware implements NestMiddleware {
  constructor(
    @Inject(Services.GROUPS) private readonly groupServices: IGroupServices,
  ) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    console.log('... middleware in group...');
    const { id: userId } = req.user;

    const id = parseInt(req.params.id);
    if (isNaN(id)) throw new GroupInvalidException();

    const params = { userId, id };
    const user = await this.groupServices.hasAccess(params);

    if (user) {
      next();
    } else {
      throw new GroupNotFoundException();
    }
  }
}
