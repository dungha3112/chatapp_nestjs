import { InjectRepository } from '@nestjs/typeorm';
import { Group, GroupMessage } from 'src/utils/typeorm';
import {
  CreateGroupMessageParams,
  CreateGroupMessageResponse,
  DeleteGroupMessageParams,
  EditGroupMessageParams,
} from 'src/utils/types';
import { Repository } from 'typeorm';
import { IGroupMessageServices } from '../interfaces/group-messages';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Services } from 'src/utils/constants';
import { IGroupServices } from '../interfaces/group';
import { GroupNotFoundException } from '../exceptions/GroupNotFound';

@Injectable()
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
    if (!group) throw new GroupNotFoundException();

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
    if (!group) throw new GroupNotFoundException();

    const messages = await this.groupMessageRepository.find({
      where: { group: { id: groupId } },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });

    return messages;
  }

  async deleteGroupMessage(params: DeleteGroupMessageParams) {
    const { userId, groupId, messageId } = params;
    const msgParams = { id: groupId, limit: 5 };

    const group = await this.groupServices.getMessages(msgParams);

    const message = await this.groupMessageRepository.findOne({
      where: {
        id: messageId,
        author: { id: userId },
      },
      relations: ['group', 'author'],
    });

    if (!message)
      throw new HttpException(
        'Message not found or you can not delete',
        HttpStatus.BAD_REQUEST,
      );

    if (group.lastMessageSent.id !== message.id) {
      await this.groupMessageRepository.delete({ id: messageId });
    } else {
      await this.deleteLastMessage(group, message);
    }

    return message;
  }

  async deleteLastMessage(group: Group, message: GroupMessage) {
    const size = group.messages.length;
    const SECOND_MESSAGE_INDEX = 1;

    if (size <= 1) {
      console.log('Last group Message Sent is deleted');

      await this.groupServices.updateGroup({
        id: group.id,
        lastMessageSent: null,
      });

      return this.groupMessageRepository.delete({ id: message.id });
    } else {
      console.log('There are more than 1 conversation message');
      const newLastMessage = group.messages[SECOND_MESSAGE_INDEX];

      await this.groupServices.updateGroup({
        id: group.id,
        lastMessageSent: newLastMessage,
      });

      return this.groupMessageRepository.delete({ id: message.id });
    }
  }

  async editMessage(params: EditGroupMessageParams): Promise<GroupMessage> {
    const { content, groupId, messageId, userId } = params;

    const messageDb = await this.groupMessageRepository.findOne({
      where: {
        id: messageId,
        group: { id: groupId },
        author: { id: userId },
      },
      relations: ['group', 'group.owner', 'group.users', 'author'],
    });

    if (!messageDb)
      throw new HttpException(
        'Message not found or you can not edit message',
        HttpStatus.BAD_REQUEST,
      );

    messageDb.content = content;
    return await this.groupMessageRepository.save(messageDb);
  }
}
