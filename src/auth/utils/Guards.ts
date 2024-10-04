import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<any> {
    const result = (await super.canActivate(context)) as boolean;
    const request = await context.switchToHttp().getRequest();
    await super.logIn(request);
    console.log('------- LocalAuthGuard');

    console.log(result);
    console.log('------- LocalAuthGuard end');

    return result;
  }
}

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<any> {
    const request = await context.switchToHttp().getRequest();

    return request.isAuthenticated();
  }
}