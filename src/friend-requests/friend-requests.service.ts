import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IFriendRequestServices } from './friend-requests';
import { CreateFriendParams, FriendRequestParams } from 'src/utils/types';
import { InjectRepository } from '@nestjs/typeorm';
import { Friend, FriendRequest } from 'src/utils/typeorm';
import { Repository } from 'typeorm';
import { Services } from 'src/utils/constants';
import { IuserServices } from 'src/users/user';
import { IFriendsServices } from 'src/friends/friends';
import { UserNotFoundException } from 'src/users/exceptions/UserNotFound';
import { FriendAlreadyExists } from 'src/friends/exceptions/FriendAlreadyExists';
import { FriendRequestNotFoundException } from './exceptions/FriendRequestNotFound';
import { FriendRequestAcceptedException } from './exceptions/FriendRequestAccepted';
import { FriendRequestException } from './exceptions/FriendRequest';
import { FriendRequestPending } from './exceptions/FriendRequestPending';

@Injectable()
export class FriendRequestServices implements IFriendRequestServices {
  constructor(
    @Inject(Services.FRIENDS)
    private readonly friendsService: IFriendsServices,
    @Inject(Services.USERS)
    private readonly userService: IuserServices,

    @InjectRepository(FriendRequest)
    private readonly friendRequestRepository: Repository<FriendRequest>,

    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
  ) {}

  async create(params: CreateFriendParams): Promise<FriendRequest> {
    const { sender, email } = params;

    const receiver = await this.userService.findUser({ email });
    if (!receiver) throw new UserNotFoundException();

    if (sender.id === receiver.id) throw new FriendRequestException();

    const exists = await this.isFending(sender.id, receiver.id);
    if (exists) throw new FriendRequestPending();

    const isFriend = await this.friendsService.isFriend(sender.id, receiver.id);
    if (isFriend) throw new FriendAlreadyExists();

    const newFriend = this.friendRequestRepository.create({
      sender,
      receiver,
      status: 'pending',
    });
    return this.friendRequestRepository.save(newFriend);
  }

  async accept(
    params: FriendRequestParams,
  ): Promise<{ friend: Friend; friendRequest: FriendRequest }> {
    const { userId, id } = params;

    const friendRequest = await this.findById(id);
    if (!friendRequest) throw new FriendRequestNotFoundException();

    if (friendRequest.status === 'accepted')
      throw new FriendRequestAcceptedException();

    if (
      friendRequest.receiver.id !== userId ||
      friendRequest.receiver.id === userId
    )
      throw new FriendRequestException();

    friendRequest.status = 'accepted';
    const updateFriendRequest =
      await this.friendRequestRepository.save(friendRequest);

    const newFriend = this.friendRepository.create({
      sender: friendRequest.sender,
      receiver: friendRequest.receiver,
    });

    const saveFriend = await this.friendRepository.save(newFriend);

    return {
      friend: saveFriend,
      friendRequest: updateFriendRequest,
    };
  }

  findById(id: number): Promise<FriendRequest> {
    return this.friendRequestRepository.findOne({
      where: { id },
      relations: ['receiver', 'sender'],
    });
  }

  async isFending(
    senderId: number,
    receiverId: any,
  ): Promise<FriendRequest | undefined> {
    return await this.friendRequestRepository.findOne({
      where: [
        {
          sender: { id: senderId },
          receiver: { id: receiverId },
          status: 'pending',
        },
        {
          receiver: { id: senderId },
          sender: { id: receiverId },
          status: 'pending',
        },
      ],
    });
  }
}
