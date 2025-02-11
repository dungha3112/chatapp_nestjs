import { Group } from 'src/utils/typeorm';
import { CreateGroupParams } from 'src/utils/types';

export interface IGroupServices {
  createGroup(params: CreateGroupParams): Promise<Group>;

  getGroups(userId: number): Promise<Group[]>;

  findGroupById(id: number): Promise<Group>;

  saveGroup(group: Group): Promise<Group>;
}
