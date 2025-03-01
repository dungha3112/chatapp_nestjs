import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { Group, User } from 'src/utils/typeorm';
import { CreateGroupDto } from '../dtos/CreateGroup.dto';
import { IGroupServices } from '../interfaces/group';
import { TranferOwnerDto } from '../dtos/TranferOwner.dto';

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
  async getGroupById(
    @Param('groupId', ParseIntPipe) groupId: number,
  ): Promise<Group> {
    return await this.groupServices.findGroupById(groupId);
  }

  @Patch('/:groupId/owner')
  async updateGroupOwner(
    @AuthUser() { id: userId }: User,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() { newOwnerId }: TranferOwnerDto,
  ): Promise<Group> {
    const params = { userId, groupId, newOwnerId };
    const res = await this.groupServices.updateGroupOwner(params);
    this.eventEmitter.emit('group.owner.update', res);
    return res;
  }

  // api/groups/:groupId/leave
  @Delete('/:groupId/leave')
  async userLeaveGroup(
    @AuthUser() { id: userId }: User,
    @Param('groupId', ParseIntPipe) groupId: number,
  ): Promise<Group> {
    const params = { userId, groupId };

    const res = await this.groupServices.userLeaveGroup(params);
    this.eventEmitter.emit('group.user.leave', { group: res, userId });
    return res;
  }
}
