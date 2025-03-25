import { UpdateUserProfileParams } from 'src/utils/types';

export interface IUserProfile {
  createProfileOrUpdate(userId: number, params: UpdateUserProfileParams);
}
