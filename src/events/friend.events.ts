import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
} from '@nestjs/websockets';
import { MessagingGateway } from 'src/gateway/gateway';
import { ServerEvents } from 'src/utils/constants';
import { AuthenticatedSocket } from 'src/utils/interfaces';
import { Friend } from 'src/utils/typeorm';

@Injectable()
export class FriendEvents {
  constructor(private readonly gatway: MessagingGateway) {}

  @OnEvent(ServerEvents.FRIEND_REMOVED)
  async handleDeleteFriend(payload) {
    const { userId, friend }: { userId: number; friend: Friend } = payload;

    const receiverId =
      userId === friend.receiver.id ? friend.sender.id : friend.receiver.id;

    const receiverSocket = this.gatway.sessions.getUserSocket(receiverId);
    receiverSocket && receiverSocket.emit('onFriendDelete', friend);
  }
}
