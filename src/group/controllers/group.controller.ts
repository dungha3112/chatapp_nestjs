import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Routes, Services } from 'src/utils/constants';
import { IGroupServices } from '../interfaces/group';
import { AuthUser } from 'src/utils/decorators';
import { Group, User } from 'src/utils/typeorm';
import { CreateGroupDto } from '../dtos/CreateGroup.dto';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import { EventEmitter2 } from '@nestjs/event-emitter';

@UseGuards(AuthenticatedGuard)
@Controller(Routes.GROUPS)
export class GroupController {
  constructor(
    @Inject(Services.GROUPS) private readonly groupServices: IGroupServices,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  async createGroup(
    @AuthUser() user: User,
    @Body() groupParams: CreateGroupDto,
  ): Promise<Group> {
    const params = { ...groupParams, owner: user };
    const group = await this.groupServices.createGroup(params);

    this.eventEmitter.emit('group.create', group);
    return group;
  }

  @Get()
  async getGroups(@AuthUser() user: User): Promise<Group[]> {
    return await this.groupServices.getGroups(user.id);
  }

  @Get('/:groupId')
  async getGroupById(@Param('groupId', ParseIntPipe) groupId: number) {
    return await this.groupServices.findGroupById(groupId);
  }
}
