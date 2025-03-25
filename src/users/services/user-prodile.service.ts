import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IImageStorageService } from 'src/image-storage/image-storage';
import { Services } from 'src/utils/constants';
import { Profile, User } from 'src/utils/typeorm';
import { UpdateUserProfileParams, UploadImageResponse } from 'src/utils/types';
import { Repository } from 'typeorm';
import { IUserProfile } from '../interfaces/users-profile';

@Injectable()
export class UserProfileService implements IUserProfile {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @Inject(Services.IMAGE_UPLOAD_SERVICE)
    private readonly imageStorageService: IImageStorageService,
  ) {}

  async createProfile() {
    const newProfile = this.profileRepository.create();
    return await this.profileRepository.save(newProfile);
  }

  async getUserProfile(id: number) {
    return await this.profileRepository.findOne({ where: { user: { id } } });
  }

  async createProfileOrUpdate(userId: number, params: UpdateUserProfileParams) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user.profile) {
      user.profile = await this.createProfile();

      return await this.updateProfile(user, params);
    }

    return await this.updateProfile(user, params);
  }

  async updateProfile(user: User, params: UpdateUserProfileParams) {
    const { about, avatar, banner } = params;

    if (about) {
      user.profile.about = about;
    }

    if (avatar) {
      user.profile.avatar = await this.updateAvatar(avatar);
    }

    if (banner) {
      user.profile.banner = await this.updateBanner(banner);
    }

    return await this.userRepository.save(user);
  }

  async updateAvatar(file: Express.Multer.File): Promise<UploadImageResponse> {
    return await this.imageStorageService.upload(file);
  }

  async updateBanner(file: Express.Multer.File): Promise<UploadImageResponse> {
    return await this.imageStorageService.upload(file);
  }
}
