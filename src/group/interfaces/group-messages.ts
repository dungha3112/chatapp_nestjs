import { GroupMessage } from 'src/utils/typeorm';
import {
  CreateGroupMessageParams,
  CreateGroupMessageResponse,
} from 'src/utils/types';

export interface IGroupMessageServices {
  createGroupMessage(
    params: CreateGroupMessageParams,
  ): Promise<CreateGroupMessageResponse>;

  getGroupMessagesById(groupId: number): Promise<GroupMessage[]>;
}
