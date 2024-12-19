import { InjectRepository } from '@nestjs/typeorm';
import { GroupMessage } from 'src/utils/typeorm';
import {
  CreateGroupMessageParams,
  CreateGroupMessageResponse,
} from 'src/utils/types';
import { Repository } from 'typeorm';
import { IGroupMessageServices } from '../interfaces/group-messages';
import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Services } from 'src/utils/constants';
import { IGroupServices } from '../interfaces/group';

export class GroupMessageServices implements IGroupMessageServices {
  constructor(
    @InjectRepository(GroupMessage)
    private readonly groupMessageRepository: Repository<GroupMessage>,

    @Inject(Services.GROUPS) private readonly groupServices: IGroupServices,
  ) {}

  /**
   * createGroupMessage
   * @param params
   * @returns
   */
  async createGroupMessage(
    params: CreateGroupMessageParams,
  ): Promise<CreateGroupMessageResponse> {
    const { content, groupId, user } = params;

    const group = await this.groupServices.findGroupById(groupId);

    const findUser = group.users.find((u) => u.id === user.id);
    if (!findUser)
      throw new HttpException('User not in group.', HttpStatus.BAD_REQUEST);

    const newGroupMessage = this.groupMessageRepository.create({
      author: user,
      content,
      group: { id: groupId },
    });

    const saveGroupMessage =
      await this.groupMessageRepository.save(newGroupMessage);

    // update lastMessage
    group.lastMessageSent = { id: saveGroupMessage.id } as GroupMessage;
    const updateGroup = await this.groupServices.saveGroup(group);
    delete saveGroupMessage.group;

    return {
      message: saveGroupMessage,
      group: { ...updateGroup, lastMessageSent: saveGroupMessage },
    };
  }

  async getGroupMessagesById(groupId: number): Promise<GroupMessage[]> {
    const group = await this.groupServices.findGroupById(groupId);

    const messages = await this.groupMessageRepository.find({
      where: { group: { id: groupId } },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });

    console.log(messages);

    return messages;
  }
}
