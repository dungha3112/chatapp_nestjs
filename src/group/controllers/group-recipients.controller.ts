import {
  Body,
  Controller,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { User } from 'src/utils/typeorm';
import { AddGroupRecipientDto } from '../dtos/AddGroupRecipient.dto';
import { IGroupRecipientsServices } from '../interfaces/group-recipients';

@UseGuards(AuthenticatedGuard)
@Controller(Routes.GROUPS_RECIPIENTS)
export class GroupRecipientsController {
  constructor(
    @Inject(Services.GROUPS_RECIPIENTS)
    private readonly groupRecipientsServices: IGroupRecipientsServices,
  ) {}

  @Post()
  addGroupRecipient(
    @AuthUser() { id: userId }: User,
    @Param('groupId', ParseIntPipe) groupId: number,

    @Body() { email }: AddGroupRecipientDto,
  ) {
    const params = { userId, groupId, email };

    const res = this.groupRecipientsServices.addGroupRecipient(params);
    return res;
  }
}
