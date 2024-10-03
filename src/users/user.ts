import { CreateUserDetails, LoginUserDetails } from 'src/utils/types';

export interface IuserServices {
  createUser(userDetails: CreateUserDetails);
  loginUser(userDetails: LoginUserDetails);
}
