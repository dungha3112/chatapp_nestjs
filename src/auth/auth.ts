import { User } from 'src/utils/typeorm';
import { ValidateUserDetails } from 'src/utils/types';

export interface IAuthServices {
  validateUser(userCredentials: ValidateUserDetails): Promise<User | null>;
}
