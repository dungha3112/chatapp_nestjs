import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from './types';
import { instanceToPlain } from 'class-transformer';

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = <AuthenticatedRequest>ctx.switchToHttp().getRequest();

    return instanceToPlain(request.user);
  },
);
