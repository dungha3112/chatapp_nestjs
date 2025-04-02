import { Module } from '@nestjs/common';
import { UsersController } from './controllers/user.controller';
import { Services } from 'src/utils/constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile, User } from 'src/utils/typeorm';
import { UserServices } from './services/user.service';
import { UserProfilesController } from './controllers/user-profiles.controller';
import { UserProfileService } from './services/user-prodile.service';
import { ImageStorageModule } from 'src/image-storage/image-storage.module';
import { SessionsModule } from 'src/sessions/sessions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile]),
    ImageStorageModule,
    SessionsModule,
  ],

  controllers: [UsersController, UserProfilesController],

  providers: [
    { provide: Services.USERS, useClass: UserServices },
    { provide: Services.USERS_PROFILES, useClass: UserProfileService },
  ],

  exports: [
    { provide: Services.USERS, useClass: UserServices },
    { provide: Services.USERS_PROFILES, useClass: UserProfileService },
  ],
})
export class UsersModule {}
