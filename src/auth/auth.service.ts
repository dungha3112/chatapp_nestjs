import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IAuthServices } from './auth';
import { IuserServices } from 'src/users/user';
import { Services } from 'src/utils/constants';
import { User } from 'src/utils/typeorm';
import { ValidateUserDetails } from 'src/utils/types';
import { compareHash } from 'src/utils/helpers';

@Injectable()
export class AuthService implements IAuthServices {
  constructor(
    @Inject(Services.USERS) private readonly userServices: IuserServices,
  ) {}

  async validateUser(userDetails: ValidateUserDetails): Promise<User | null> {
    const user = await this.userServices.findUser({
      email: userDetails.email,
    });

    if (!user)
      throw new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED);
    const isPasswordValid = await compareHash(
      userDetails.password,
      user.password,
    );
    if (!isPasswordValid)
      throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);

    return isPasswordValid ? user : null;
  }
}
