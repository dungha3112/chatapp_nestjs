import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Friend } from 'src/utils/typeorm';
import { Repository } from 'typeorm';
import { IFriendsServices } from './friends';

@Injectable()
export class FriendsServices implements IFriendsServices {
  constructor(
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
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
      where: [
        {
          sender: { id },
        },
        {
          receiver: { id },
        },
      ],
    });
  }
}
