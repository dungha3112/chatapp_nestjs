import {
  Body,
  Controller,
  Inject,
  Patch,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import { Routes, Services, UserProfileFileFields } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { User } from 'src/utils/typeorm';
import { UserProfileUpdateDto } from '../dtos/UserProfileUpdate.dto';
import { IUserProfile } from '../interfaces/users-profile';
import { UpdateUserProfileParams, UserProfileFiles } from 'src/utils/types';

@Controller(Routes.USERS_PROFILES)
export class UserProfilesController {
  constructor(
    @Inject(Services.USERS_PROFILES)
    private readonly userProfileService: IUserProfile,
  ) {}

  @UseGuards(AuthenticatedGuard)
  @Patch()
  @UseInterceptors(FileFieldsInterceptor(UserProfileFileFields))
  async updateUserProfile(
    @AuthUser() { id: userId }: User,
    @UploadedFiles()
    files: UserProfileFiles,
    @Body() { about }: UserProfileUpdateDto,
  ) {
    const params: UpdateUserProfileParams = {};

    about && (params.about = about);
    files.banner && (params.banner = files.banner[0]);
    files.avatar && (params.avatar = files.avatar[0]);

    return await this.userProfileService.createProfileOrUpdate(userId, params);
  }
}
