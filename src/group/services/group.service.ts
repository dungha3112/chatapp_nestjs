import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from 'src/utils/typeorm';
import { CreateGroupParams } from 'src/utils/types';
import { Repository } from 'typeorm';
import { IGroupServices } from '../group';
import { Services } from 'src/utils/constants';
import { IuserServices } from 'src/users/user';

@Injectable()
export class GroupService implements IGroupServices {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,

    @Inject(Services.USERS) private readonly userServices: IuserServices,
  ) {}

  /**
   * create a new group chat
   * @param params
   */
  async createGroup(params: CreateGroupParams): Promise<Group> {
    const { owner, title, users } = params;
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

    return saveGroup;
  }

  async getGroups(userId: number): Promise<Group[]> {
    const groups = await this.groupRepository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.users', 'user')
      .where('user.id IN (:users)', { users: [userId] })
      .leftJoinAndSelect('group.owner', 'owner')
      .leftJoinAndSelect('group.users', 'users')
      .leftJoinAndSelect('group.lastMessageSent', 'lastMessageSent')
      .getMany();

    return groups;
  }

  async getGroupById(id: number): Promise<Group> {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['lastMessageSent', 'owner', 'users', 'messages'],
    });
    if (!group)
      throw new HttpException(
        'Groups not found with this id',
        HttpStatus.BAD_REQUEST,
      );
    return group;
  }
}
