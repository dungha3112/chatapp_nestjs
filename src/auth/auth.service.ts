import { Inject, Injectable } from '@nestjs/common';
import { IAuthServices } from './auth';
import { IuserServices } from 'src/users/user';
import { Services } from 'src/utils/constants';

@Injectable()
export class AuthService implements IAuthServices {
  constructor(
    @Inject(Services.USERS) private readonly userServices: IuserServices,
  ) {}

  async validateUser() {}
}
