import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IGroupRecipientsServices } from '../interfaces/group-recipients';
import { AddGroupRecipientParams } from 'src/utils/types';
import { Services } from 'src/utils/constants';
import { IuserServices } from 'src/users/user';
import { IGroupServices } from '../interfaces/group';

@Injectable()
export class GroupRecipientsServices implements IGroupRecipientsServices {
  constructor(
    @Inject(Services.USERS) private readonly userServices: IuserServices,
    @Inject(Services.GROUPS) private readonly groupServices: IGroupServices,
  ) {}

  async addGroupRecipient(params: AddGroupRecipientParams) {
    const { email, userId, groupId } = params;
    const group = await this.groupServices.findGroupById(groupId);

    if (group.owner.id !== userId) {
      throw new HttpException('Insufficient permissions', HttpStatus.FORBIDDEN);
    }

    const recipient = await this.userServices.findUser({ email: email });
    if (!recipient)
      throw new HttpException('User does not exists !', HttpStatus.BAD_REQUEST);

    const inGroup = group.users.find((user) => user.id === recipient.id);
    if (inGroup)
      throw new HttpException('User already in group!', HttpStatus.BAD_REQUEST);

    group.users.push(recipient);
    const newGroup = await this.groupServices.saveGroup(group);
    return newGroup;
  }
}
