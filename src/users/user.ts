import { User } from 'src/utils/typeorm';
import {
  CreateUserDetails,
  FindUserOptions,
  FindUserParams,
} from 'src/utils/types';

export interface IuserServices {
  createUser(userDetails: CreateUserDetails): Promise<User>;

  findUser(
    findUserParams: FindUserParams,
    options?: FindUserOptions,
  ): Promise<User>;
}
