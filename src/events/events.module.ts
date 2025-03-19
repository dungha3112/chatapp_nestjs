import { Module } from '@nestjs/common';
import { GatewayModule } from 'src/gateway/gateway.module';
import { FriendRequestsEvents } from './friends-requests.events';
import { FriendEvents } from './friend.events';

@Module({
  imports: [GatewayModule],
  providers: [FriendRequestsEvents, FriendEvents],
})
export class EventModule {}
