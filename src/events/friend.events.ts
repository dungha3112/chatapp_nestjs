import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MessagingGateway } from 'src/gateway/gateway';
import { ServerEvents } from 'src/utils/constants';
import { Friend } from 'src/utils/typeorm';

@Injectable()
export class FriendEvents {
  constructor(private readonly gatway: MessagingGateway) {}

  @OnEvent(ServerEvents.FRIEND_DELETE)
  async handleDeleteFriend(payload: Friend) {
    const receiverSocket = this.gatway.sessions.getUserSocket(
      payload.receiver.id,
    );
    receiverSocket && receiverSocket.emit('onFriendDelete', payload);
  }
}
