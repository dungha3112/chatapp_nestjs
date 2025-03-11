import { GroupMessage } from 'src/utils/typeorm';
import {
  CreateGroupMessageParams,
  CreateGroupMessageResponse,
  DeleteGroupMessageParams,
  EditGroupMessageParams,
} from 'src/utils/types';

export interface IGroupMessageServices {
  createGroupMessage(
    params: CreateGroupMessageParams,
  ): Promise<CreateGroupMessageResponse>;

  getGroupMessagesById(
    groupId: number,
    skip: number,
  ): Promise<[GroupMessage[], number]>;

  deleteGroupMessage(params: DeleteGroupMessageParams);

  editMessage(params: EditGroupMessageParams): Promise<GroupMessage>;
}
