import { Friend } from 'src/utils/typeorm';
import { DeleteFriendRequestParams } from 'src/utils/types';

export interface IFriendsServices {
  isFriend(userId: number, receiverId: number): Promise<Friend | undefined>;

  getFriends(id: number): Promise<Friend[]>;

  findById(id: number): Promise<Friend | undefined>;

  deleteFriend(params: DeleteFriendRequestParams): Promise<Friend>;

  searchUsers(query: string): Promise<Friend[]>;
}
