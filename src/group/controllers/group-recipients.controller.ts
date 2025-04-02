import {
  Body,
  Controller,
  Delete,
  Inject,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { Group, User } from 'src/utils/typeorm';
import {
  AddGroupUserResponse,
  RemoveGroupRecipientResponse,
} from 'src/utils/types';
import { AddGroupRecipientDto } from '../dtos/AddGroupRecipient.dto';
import { IGroupRecipientsServices } from '../interfaces/group-recipients';

// @UseGuards(AuthenticatedGuard)
@Controller(Routes.GROUPS_RECIPIENTS)
export class GroupRecipientsController {
  constructor(
    @Inject(Services.GROUPS_RECIPIENTS)
    private readonly groupRecipientsServices: IGroupRecipientsServices,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  async addGroupRecipient(
    @AuthUser() { id: ownerId }: User,
    @Param('id', ParseIntPipe) id: number,

    @Body() { username }: AddGroupRecipientDto,
  ): Promise<AddGroupUserResponse> {
    const params = { ownerId, id, username };

    const res = await this.groupRecipientsServices.addGroupRecipient(params);
    this.eventEmitter.emit('group.user.add', res);

    return res;
  }

  // owner remove user to list group.users
  // api/groups/:id/recipients/:removeUserId
  @Delete('/:removeUserId')
  async removeGroupRecipient(
    @AuthUser() { id: ownerId }: User,
    @Param('id', ParseIntPipe) id: number,
    @Param('removeUserId', ParseIntPipe) removeUserId: number,
  ): Promise<Group> {
    const params = { ownerId, id, removeUserId };
    const res: RemoveGroupRecipientResponse =
      await this.groupRecipientsServices.removeGroupRecipient(params);

    this.eventEmitter.emit('group.user.remove', res);
    return res.group;
  }
}
