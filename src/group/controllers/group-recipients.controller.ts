import {
  Body,
  Controller,
  Delete,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { User } from 'src/utils/typeorm';
import {
  AddGroupUserResponse,
  RemoveGroupRecipientResponse,
} from 'src/utils/types';
import { AddGroupRecipientDto } from '../dtos/AddGroupRecipient.dto';
import { IGroupRecipientsServices } from '../interfaces/group-recipients';

@UseGuards(AuthenticatedGuard)
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
    @Param('groupId', ParseIntPipe) groupId: number,

    @Body() { email }: AddGroupRecipientDto,
  ): Promise<AddGroupUserResponse> {
    const params = { ownerId, groupId, email };

    const res = await this.groupRecipientsServices.addGroupRecipient(params);
    this.eventEmitter.emit('group.add.user', res);

    return res;
  }

  @Delete('/:removeUserId')
  removeGroupRecipient(
    @AuthUser() { id: ownerId }: User,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('removeUserId', ParseIntPipe) removeUserId: number,
  ): Promise<RemoveGroupRecipientResponse> {
    const params = { ownerId, groupId, removeUserId };
    const res = this.groupRecipientsServices.removeGroupRecipient(params);

    return res;
  }
}
