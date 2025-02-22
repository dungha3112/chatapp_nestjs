import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IGroupRecipientsServices } from '../interfaces/group-recipients';
import {
  AddGroupRecipientParams,
  AddGroupUserResponse,
  RemoveGroupRecipientParams,
  RemoveGroupRecipientResponse,
} from 'src/utils/types';
import { Services } from 'src/utils/constants';
import { IuserServices } from 'src/users/user';
import { IGroupServices } from '../interfaces/group';
import { GroupNotFoundException } from '../exceptions/GroupNotFound';
import { NotGroupOwnerException } from '../exceptions/NotGroupOwner';

@Injectable()
export class GroupRecipientsServices implements IGroupRecipientsServices {
  constructor(
    @Inject(Services.USERS) private readonly userServices: IuserServices,
    @Inject(Services.GROUPS) private readonly groupServices: IGroupServices,
  ) {}

  async addGroupRecipient(
    params: AddGroupRecipientParams,
  ): Promise<AddGroupUserResponse> {
    const { email, ownerId, groupId } = params;
    const group = await this.groupServices.findGroupById(groupId);
    if (!group) throw new GroupNotFoundException();

    if (group.owner.id !== ownerId) throw new NotGroupOwnerException();

    const recipient = await this.userServices.findUser({ email: email });
    if (!recipient)
      throw new HttpException('User does not exists !', HttpStatus.BAD_REQUEST);

    const inGroup = group.users.find((user) => user.id === recipient.id);
    if (inGroup)
      throw new HttpException('User already in group!', HttpStatus.BAD_REQUEST);

    group.users.push(recipient);
    const saveGroup = await this.groupServices.saveGroup(group);

    return {
      group: saveGroup,
      user: recipient,
    };
  }

  async removeGroupRecipient(
    params: RemoveGroupRecipientParams,
  ): Promise<RemoveGroupRecipientResponse> {
    const { groupId, ownerId, removeUserId } = params;

    const group = await this.groupServices.findGroupById(groupId);
    if (!group) throw new GroupNotFoundException();

    const userToBeRemoved = await this.userServices.findUser({
      id: removeUserId,
    });
    if (!userToBeRemoved)
      throw new HttpException('User can not removed.', HttpStatus.BAD_REQUEST);

    if (ownerId === removeUserId)
      throw new HttpException(
        'Can not leave group as owner',
        HttpStatus.BAD_REQUEST,
      );

    if (group.owner.id !== ownerId) throw new NotGroupOwnerException();

    const checkUserInGroup = group.users.find((u) => u.id === removeUserId);
    if (!checkUserInGroup)
      throw new HttpException('User not in group.', HttpStatus.BAD_REQUEST);

    const newUserGroup = group.users.filter((user) => user.id !== removeUserId);

    group.users = newUserGroup;

    const saveGroup = await this.groupServices.saveGroup(group);

    return { group: saveGroup, user: userToBeRemoved };
  }
}
