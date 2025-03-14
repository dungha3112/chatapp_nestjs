import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Friend, FriendRequest } from 'src/utils/typeorm';
import { Repository } from 'typeorm';
import { IFriendsServices } from './friends';
import { DeleteFriendRequestParams } from 'src/utils/types';
import { FriendNotFoundException } from './exceptions/FriendNotFound';
import { DeleteFriendException } from './exceptions/DeleteFriend';
import { Services } from 'src/utils/constants';
import { IFriendRequestServices } from 'src/friend-requests/friend-requests';

@Injectable()
export class FriendsServices implements IFriendsServices {
  constructor(
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,

    @InjectRepository(FriendRequest)
    private readonly friendRequestRepository: Repository<FriendRequest>,
  ) {}

  async isFriend(
    userId: number,
    receiverId: number,
  ): Promise<Friend | undefined> {
    return await this.friendRepository.findOne({
      where: [
        { sender: { id: userId }, receiver: { id: receiverId } },
        { sender: { id: receiverId }, receiver: { id: userId } },
      ],
    });
  }

  async getFriends(id: number): Promise<Friend[]> {
    return await this.friendRepository.find({
      where: [{ sender: { id } }, { receiver: { id } }],
      relations: ['sender', 'receiver'],
    });
  }

  async findById(id: number): Promise<Friend | undefined> {
    return await this.friendRepository.findOne({
      where: { id },
      relations: ['sender', 'receiver'],
    });
  }

  async deleteFriend(params: DeleteFriendRequestParams): Promise<Friend> {
    const { id, userId } = params;

    const friend = await this.findById(id);
    if (!friend) throw new FriendNotFoundException();

    const senderId = friend.sender.id;
    const receiverId = friend.receiver.id;

    if (senderId !== userId && receiverId !== userId) {
      console.log(11111);
      throw new DeleteFriendException();
    }
    const friendRequest = await this.friendRequestRepository.findOne({
      where: [
        {
          sender: { id: senderId },
          receiver: { id: receiverId },
        },
        {
          sender: { id: receiverId },
          receiver: { id: senderId },
        },
      ],
      relations: ['sender', 'receiver'],
    });

    if (!friendRequest) throw new FriendNotFoundException();

    if (
      friendRequest.sender.id !== userId &&
      friendRequest.receiver.id !== userId
    ) {
      throw new DeleteFriendException();
    }

    await this.friendRequestRepository.delete({ id: friendRequest.id });

    await this.friendRepository.delete({ id });
    return friend;
  }
}
