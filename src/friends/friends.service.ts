import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Friend, FriendRequest } from 'src/utils/typeorm';
import { DeleteFriendRequestParams } from 'src/utils/types';
import { Repository } from 'typeorm';
import { DeleteFriendException } from './exceptions/DeleteFriend';
import { FriendNotFoundException } from './exceptions/FriendNotFound';
import { IFriendsServices } from './friends';

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
      relations: ['sender', 'receiver', 'receiver.profile', 'sender.profile'],
    });
  }

  async findById(id: number): Promise<Friend | undefined> {
    return await this.friendRepository.findOne({
      where: { id },
      relations: ['sender', 'receiver'],
    });
  }

  async searchUsers(query: string): Promise<Friend[]> {
    const statement =
      '(sender.firstName LIKE :query OR sender.username LIKE :query OR sender.lastName LIKE :query ' +
      'OR receiver.firstName LIKE :query OR receiver.username LIKE :query OR receiver.lastName LIKE :query)';

    return this.friendRepository
      .createQueryBuilder('friend')
      .leftJoinAndSelect('friend.sender', 'sender')
      .leftJoinAndSelect('friend.receiver', 'receiver')
      .where(statement, { query: `%${query}%` })
      .limit(10)
      .addSelect([
        'sender.firstName',
        'sender.lastName',
        'sender.username',
        'sender.id',
        'receiver.firstName',
        'receiver.lastName',
        'receiver.username',
        'receiver.id',
      ])
      .getMany();
  }

  async deleteFriend(params: DeleteFriendRequestParams): Promise<Friend> {
    const { id, userId } = params;

    const friend = await this.findById(id);
    if (!friend) throw new FriendNotFoundException();

    const senderId = friend.sender.id;
    const receiverId = friend.receiver.id;

    if (senderId !== userId && receiverId !== userId) {
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
