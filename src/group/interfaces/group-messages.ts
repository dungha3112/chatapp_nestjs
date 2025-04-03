import { GroupMessage } from 'src/utils/typeorm';
import {
  CreateMessageParams,
  CreateGroupMessageResponse,
  DeleteGroupMessageParams,
  EditGroupMessageParams,
} from 'src/utils/types';

export interface IGroupMessageServices {
  createGroupMessage(
    params: CreateMessageParams,
  ): Promise<CreateGroupMessageResponse>;

  getGroupMessagesById(id: number, skip: number): Promise<GroupMessage[]>;

  deleteGroupMessage(params: DeleteGroupMessageParams);

  editMessage(params: EditGroupMessageParams): Promise<GroupMessage>;
}
