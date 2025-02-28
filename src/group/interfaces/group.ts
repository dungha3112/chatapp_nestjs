import { Group, User } from 'src/utils/typeorm';
import {
  AccessGroupParams,
  CreateGroupParams,
  GetGroupMessagesParams,
  TranferOwnerParams,
  UpdateGroupParams,
} from 'src/utils/types';

export interface IGroupServices {
  createGroup(params: CreateGroupParams): Promise<Group>;

  getGroups(userId: number): Promise<Group[]>;

  findGroupById(id: number): Promise<Group>;

  saveGroup(group: Group): Promise<Group>;

  updateGroup(params: UpdateGroupParams);

  getMessages(params: GetGroupMessagesParams): Promise<Group>;

  hasAccess(params: AccessGroupParams): Promise<User>;

  updateGroupOwner(params: TranferOwnerParams): Promise<Group>;
}
