import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConversationsModule } from './conversations/conversations.module';
import { EventModule } from './events/events.module';
import { FriendRequestsModule } from './friend-requests/friend-requests.module';
import { FriendsModule } from './friends/friends.module';
import { GatewayModule } from './gateway/gateway.module';
import { GroupModule } from './group/group.module';
import { MessagesModule } from './messages/messages.module';
import { UsersModule } from './users/users.module';
import { ThrottlerBehindProxyGuard } from './utils/throttler';
import { entities } from './utils/typeorm';
import { ExistsModule } from './exists/exists.module';
import { ImageStorageModule } from './image-storage/image-storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    AuthModule,
    UsersModule,
    PassportModule.register({ session: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_DB_HOST,
      port: process.env.MYSQL_DB_PORT,
      username: process.env.MYSQL_DB_USERNAME,
      password: process.env.MYSQL_DB_PASSWORD,
      database: process.env.MYSQL_DB_DATABASE,
      synchronize: true,
      // logging: true,
      entities: entities,
    }),
    EventEmitterModule.forRoot(),
    ConversationsModule,
    MessagesModule,
    GatewayModule,
    GroupModule,
    FriendsModule,
    FriendRequestsModule,

    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 10, limit: 10, blockDuration: 10 }],
      errorMessage: 'Too many requests, slow down!',
    }),

    ExistsModule,
    EventModule,
    ImageStorageModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
  ],
})
export class AppModule {}
