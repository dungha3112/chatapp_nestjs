import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Group, GroupMessage, User } from 'src/utils/typeorm';
import {
  AccessGroupParams,
  CheckUserInGroupParams,
  CreateGroupParams,
  GetGroupMessagesParams,
  TranferOwnerParams,
  UpdateGroupParams,
  UserLeaveGroupParams,
} from 'src/utils/types';
import { Repository } from 'typeorm';
import { IGroupServices } from '../interfaces/group';
import { Services } from 'src/utils/constants';
import { IuserServices } from 'src/users/user';
import { GroupNotFoundException } from '../exceptions/GroupNotFound';
import { GroupOwnerTransferException } from '../exceptions/GroupOwnerTransfer';
import { GroupParticipantNotFoundException } from '../exceptions/GroupParticipantNotFound';

@Injectable()
export class GroupService implements IGroupServices {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,

    @InjectRepository(GroupMessage)
    private readonly groupMessageRepository: Repository<GroupMessage>,

    @Inject(Services.USERS) private readonly userServices: IuserServices,
  ) {}

  /**
   * create a new group chat
   * @param params
   */
  async createGroup(params: CreateGroupParams): Promise<Group> {
    const { owner, title, users, message } = params;
    const userPromise = users.map(
      async (email) => await this.userServices.findUser({ email }),
    );

    const usersDb = await Promise.all(userPromise);

    usersDb.push(owner);

    const newGroup = this.groupRepository.create({
      users: usersDb,
      owner,
      title,
    });

    const saveGroup = await this.groupRepository.save(newGroup);

    const newMessage = this.groupMessageRepository.create({
      content: message,
      group: saveGroup,
      author: owner,
    });
    const saveMessage = await this.groupMessageRepository.save(newMessage);

    saveGroup.lastMessageSent = saveMessage;

    const updateMessageGroup = await this.groupRepository.save(saveGroup);
    delete updateMessageGroup.lastMessageSent.group;

    return updateMessageGroup;
  }

  async getGroups(userId: number): Promise<Group[]> {
    const groups = await this.groupRepository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.users', 'user')
      .where('user.id IN (:users)', { users: [userId] })
      .leftJoinAndSelect('group.owner', 'owner')
      .leftJoinAndSelect('group.users', 'users')
      .leftJoinAndSelect('group.lastMessageSent', 'lastMessageSent')
      .leftJoinAndSelect('lastMessageSent.author', 'author')
      .orderBy('lastMessageSent.createdAt', 'DESC')
      .getMany();

    return groups;
  }

  async findGroupById(id: number): Promise<Group> {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: [
        'lastMessageSent',
        'owner',
        'users',
        'lastMessageSent.author',
      ],
    });
    return group;
  }

  async saveGroup(group: Group): Promise<Group> {
    return await this.groupRepository.save(group);
  }

  async updateGroup(params: UpdateGroupParams) {
    const { id, lastMessageSent } = params;
    return await this.groupRepository.update(id, { lastMessageSent });
  }

  async getMessages({ id, limit }: GetGroupMessagesParams): Promise<Group> {
    const group = await this.groupRepository
      .createQueryBuilder('group')
      .where('id = :id', { id })
      .leftJoinAndSelect('group.lastMessageSent', 'lastMessageSent')
      .leftJoinAndSelect('group.messages', 'message')
      .where('group.id = :id', { id })
      .orderBy('message.createdAt', 'DESC')
      .limit(limit)
      .getOne();

    if (!group) throw new GroupNotFoundException();

    return group;
  }

  async hasAccess(params: AccessGroupParams): Promise<User> {
    const { groupId, userId } = params;

    const group = await this.findGroupById(groupId);
    if (!group) throw new GroupNotFoundException();

    const user = group.users.find((u) => u.id === userId);
    return user;
  }

  async updateGroupOwner(params: TranferOwnerParams): Promise<Group> {
    const { groupId, userId, newOwnerId } = params;

    const group = await this.findGroupById(groupId);
    if (!group) throw new GroupNotFoundException();

    if (group.owner.id !== userId)
      throw new GroupOwnerTransferException('Insufficient Permissions');

    if (group.owner.id === newOwnerId)
      throw new GroupOwnerTransferException(
        'Cannot Transfer Owner to yourself',
      );

    const newOwner = await this.userServices.findUser({ id: newOwnerId });
    if (!newOwner)
      throw new HttpException('User not found.', HttpStatus.BAD_REQUEST);

    group.owner = newOwner;

    const newGroup = await this.saveGroup(group);

    return newGroup;
  }

  async userLeaveGroup(params: UserLeaveGroupParams): Promise<Group> {
    const { groupId, userId } = params;

    const group = await this.isUserInGroup(params);
    if (userId === group.owner.id)
      throw new HttpException(
        'Cannot leave group as owner',
        HttpStatus.BAD_REQUEST,
      );

    group.users = group.users.filter((u) => u.id !== userId);

    const updateGroup = await this.saveGroup(group);
    return updateGroup;
  }

  async isUserInGroup(params: CheckUserInGroupParams) {
    const { userId, groupId } = params;

    const group = await this.findGroupById(groupId);
    console.log({ group });

    if (!group) throw new GroupNotFoundException();

    const user = group.users.find((u) => u.id === userId);
    console.log({ user });

    if (!user) throw new GroupParticipantNotFoundException();

    return group;
  }
}
