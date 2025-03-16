import { Module } from '@nestjs/common';
import { GatewayModule } from 'src/gateway/gateway.module';
import { FriendRequestsEvents } from './friends-requests.events';

@Module({
  imports: [GatewayModule],
  providers: [FriendRequestsEvents],
})
export class EventModule {}
