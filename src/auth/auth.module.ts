import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { Services } from 'src/utils/constants';
import { LocalStrategy } from './utils/LocalStrategy';
import { SessionSerializer } from './utils/SessionSerializer';
import { SessionsModule } from 'src/sessions/sessions.module';

@Module({
  imports: [UsersModule, SessionsModule],
  controllers: [AuthController],
  providers: [
    LocalStrategy,
    SessionSerializer,
    { provide: Services.AUTH, useClass: AuthService },
  ],
})
export class AuthModule {}
