import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<any> {
    const result = (await super.canActivate(context)) as boolean;

    const request: Request = await context.switchToHttp().getRequest();

    await super.logIn(request);

    return result;
  }
}

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<any> {
    const request = await context.switchToHttp().getRequest();
    console.log('authenticalte guard');
    delete request?.user?.password;

    return request.isAuthenticated();
  }
}
