import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Services } from 'src/utils/constants';
import { IAuthServices } from '../auth';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(Services.AUTH) private readonly authServices: IAuthServices,
  ) {
    super({ usernameField: 'email' });
  }
  async validate(email: string, password: string) {
    const result = await this.authServices.validateUser({ email, password });
    console.log('-------validate ----');
    console.log(result);
    console.log('-------end ----');
    return result;
  }
}
