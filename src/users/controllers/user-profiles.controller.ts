import {
  Body,
  Controller,
  Inject,
  Patch,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import { ISessionServices } from 'src/sessions/sessions';
import { Routes, Services, UserProfileFileFields } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { User } from 'src/utils/typeorm';
import {
  AuthenticatedRequest,
  UpdateUserProfileParams,
  UserProfileFiles,
} from 'src/utils/types';
import { UserProfileUpdateDto } from '../dtos/UserProfileUpdate.dto';
import { IUserProfile } from '../interfaces/users-profile';

@Controller(Routes.USERS_PROFILES)
export class UserProfilesController {
  constructor(
    @Inject(Services.USERS_PROFILES)
    private readonly userProfileService: IUserProfile,

    @Inject(Services.SESSION)
    private readonly sessionService: ISessionServices,
  ) {}

  @UseGuards(AuthenticatedGuard)
  @Patch()
  @UseInterceptors(FileFieldsInterceptor(UserProfileFileFields))
  async updateUserProfile(
    @Req() req: AuthenticatedRequest,
    @AuthUser() { id: userId }: User,
    @UploadedFiles()
    files: UserProfileFiles,
    @Body() { about }: UserProfileUpdateDto,
  ): Promise<User> {
    const params: UpdateUserProfileParams = {};

    about && (params.about = about);
    files.banner && (params.banner = files.banner[0]);
    files.avatar && (params.avatar = files.avatar[0]);

    const user = await this.userProfileService.createProfileOrUpdate(
      userId,
      params,
    );
    const sessionId = req.sessionID;

    const session = await this.sessionService.updateSession(sessionId, user);

    return user;
  }
}
