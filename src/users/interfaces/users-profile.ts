import { Profile } from 'src/utils/typeorm';
import { UpdateUserProfileParams } from 'src/utils/types';

export interface IUserProfile {
  createProfileOrUpdate(userId: number, params: UpdateUserProfileParams);

  findById(id: number): Promise<Profile>;
}
