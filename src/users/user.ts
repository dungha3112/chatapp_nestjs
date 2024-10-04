import { User } from 'src/utils/typeorm';
import { CreateUserDetails, LoginUserDetails } from 'src/utils/types';

export interface IuserServices {
  createUser(userDetails: CreateUserDetails): Promise<User>;
  loginUser(userDetails: LoginUserDetails);
}
