import { FriendRequest } from 'src/utils/typeorm';
import {
  CancelFriendRequestParams,
  CreateFriendParams,
  DeleteFriendRequestParams,
  FriendRequestAcceptPayload,
  FriendRequestParams,
  RejectFriendRequestParams,
} from 'src/utils/types';

export interface IFriendRequestServices {
  create(params: CreateFriendParams): Promise<FriendRequest>;
  accept(params: FriendRequestParams): Promise<FriendRequestAcceptPayload>;
  findById(id: number): Promise<FriendRequest>;

  isFending(
    senderId: number,
    receiverId: number,
  ): Promise<FriendRequest | undefined>;

  cancel(params: CancelFriendRequestParams): Promise<FriendRequest>;

  reject(params: RejectFriendRequestParams): Promise<FriendRequest>;

  getFriendRequests(userId: number): Promise<FriendRequest[]>;

  delete(params: DeleteFriendRequestParams): Promise<FriendRequest>;
}
