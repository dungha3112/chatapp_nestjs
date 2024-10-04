import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { Services } from 'src/utils/constants';
import { LocalStrategy } from './utils/LocalStrategy';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [LocalStrategy, { provide: Services.AUTH, useClass: AuthService }],

  exports: [{ provide: Services.AUTH, useClass: AuthService }],
})
export class AuthModule {}
