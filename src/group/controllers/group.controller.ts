import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { Routes, Services } from 'src/utils/constants';
import { IGroupServices } from '../group';
import { AuthUser } from 'src/utils/decorators';
import { Group, User } from 'src/utils/typeorm';
import { CreateGroupDto } from '../dtos/CreateGroup.dto';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';

@UseGuards(AuthenticatedGuard)
@Controller(Routes.GROUPS)
export class GroupController {
  constructor(
    @Inject(Services.GROUPS) private readonly groupServices: IGroupServices,
  ) {}

  @Post()
  async createGroup(
    @AuthUser() user: User,
    @Body() groupParams: CreateGroupDto,
  ): Promise<Group> {
    const params = { ...groupParams, owner: user };
    return await this.groupServices.createGroup(params);
  }

  @Get()
  async getGroups(@AuthUser() user: User): Promise<Group[]> {
    return await this.groupServices.getGroups(user.id);
  }
}
