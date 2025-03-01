import {
  AddGroupRecipientParams,
  AddGroupUserResponse,
  RemoveGroupRecipientParams,
  RemoveGroupRecipientResponse,
} from 'src/utils/types';

export interface IGroupRecipientsServices {
  addGroupRecipient(
    params: AddGroupRecipientParams,
  ): Promise<AddGroupUserResponse>;

  removeGroupRecipient(
    params: RemoveGroupRecipientParams,
  ): Promise<RemoveGroupRecipientResponse>;
}
