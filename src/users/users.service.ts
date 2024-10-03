import { Injectable } from '@nestjs/common';
import { IuserServices } from './user';
import { CreateUserDetails, LoginUserDetails } from 'src/utils/types';

@Injectable()
export class UsersService implements IuserServices {
  createUser(userDetails: CreateUserDetails) {
    throw new Error('Method not implemented.');
  }

  loginUser(userDetails: LoginUserDetails) {
    throw new Error('Method not implemented.');
  }
}
