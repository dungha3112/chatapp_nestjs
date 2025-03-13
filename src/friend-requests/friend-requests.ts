import { Friend, FriendRequest } from 'src/utils/typeorm';
import { CreateFriendParams, FriendRequestParams } from 'src/utils/types';

export interface IFriendRequestServices {
  create(params: CreateFriendParams): Promise<FriendRequest>;
  accept(
    params: FriendRequestParams,
  ): Promise<{ friend: Friend; friendRequest: FriendRequest }>;
  findById(id: number): Promise<FriendRequest>;

  isFending(
    senderId: number,
    receiverId: number,
  ): Promise<FriendRequest | undefined>;

  cancel();
}
