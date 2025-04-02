import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { Services } from 'src/utils/constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from 'src/utils/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Session])],
  providers: [
    {
      provide: Services.SESSION,
      useClass: SessionsService,
    },
  ],

  exports: [
    {
      provide: Services.SESSION,
      useClass: SessionsService,
    },
  ],
})
export class SessionsModule {}
