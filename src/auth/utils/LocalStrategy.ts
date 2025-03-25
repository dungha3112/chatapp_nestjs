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
    super();
    // super({ usernameField: 'username' });
  }
  async validate(username: string, password: string) {
    const result = await this.authServices.validateUser({ username, password });
    console.log('-------validate ----', result);
 
    return result;
  }
}
