import { Group, User } from 'src/utils/typeorm';
import {
  AddGroupRecipientParams,
  AddGroupUserResponse,
  RemoveGroupRecipientParams,
  RemoveGroupRecipientResponse,
  CheckUserInGroupParams,
  UserLeaveGroupParams,
} from 'src/utils/types';

export interface IGroupRecipientsServices {
  addGroupRecipient(
    params: AddGroupRecipientParams,
  ): Promise<AddGroupUserResponse>;

  removeGroupRecipient(
    params: RemoveGroupRecipientParams,
  ): Promise<RemoveGroupRecipientResponse>;

  userLeaveGroup(params: UserLeaveGroupParams): Promise<Group>;

  isUserInGroup(params: CheckUserInGroupParams);
}
