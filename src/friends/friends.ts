import { Friend } from 'src/utils/typeorm';

export interface IFriendsServices {
  isFriend(userId: number, receiverId: number): Promise<Friend | undefined>;

  getFriends(id: number): Promise<Friend[]>;
}
