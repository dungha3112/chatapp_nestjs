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
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
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

  @Get('/:id')
  async getGroupById(@Param('id', ParseIntPipe) id: number): Promise<Group> {
    return await this.groupServices.findGroupById(id);
  }

  @Patch('/:id/owner')
  async updateGroupOwner(
    @AuthUser() { id: userId }: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() { newOwnerId }: TranferOwnerDto,
  ): Promise<Group> {
    const params = { userId, id, newOwnerId };
    const res = await this.groupServices.updateGroupOwner(params);
    this.eventEmitter.emit('group.owner.update', res);
    return res;
  }

  // api/groups/:id/leave
  @Delete('/:id/leave')
  async userLeaveGroup(
    @AuthUser() { id: userId }: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Group> {
    const params = { userId, id };

    const res = await this.groupServices.userLeaveGroup(params);
    this.eventEmitter.emit('group.user.leave', { group: res, userId });
    return res;
  }
}
