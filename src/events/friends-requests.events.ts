import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MessagingGateway } from 'src/gateway/gateway';
import { ServerEvents } from 'src/utils/constants';
import { FriendRequest } from 'src/utils/typeorm';
import { FriendRequestAcceptPayload } from 'src/utils/types';

@Injectable()
export class FriendRequestsEvents {
  constructor(private readonly gatway: MessagingGateway) {}

  @OnEvent(ServerEvents.FRIEND_REQUEST_CREATE)
  async handleCreateFriendRequest(payload: FriendRequest) {
    const receiverRequestSocket = this.gatway.sessions.getUserSocket(
      payload.receiver.id,
    );

    receiverRequestSocket &&
      receiverRequestSocket.emit('onFriendRequestReceived', payload);
  }

  @OnEvent(ServerEvents.FRIEND_REQUEST_ACCEPT)
  async handleAcceptFriendRequest(payload: FriendRequestAcceptPayload) {
    const { friend, friendRequest } = payload;

    const senderRequestSocket = this.gatway.sessions.getUserSocket(
      friendRequest.sender.id,
    );

    senderRequestSocket &&
      senderRequestSocket.emit('onFriendRequestAccepted', payload);
  }

  @OnEvent(ServerEvents.FRIEND_REQUEST_CANCEL)
  async handleCancelFriendRequest(payload: FriendRequest) {
    const receiverRequestSocket = this.gatway.sessions.getUserSocket(
      payload.receiver.id,
    );

    receiverRequestSocket &&
      receiverRequestSocket.emit('onFriendRequestCanceled', payload);
  }

  @OnEvent(ServerEvents.FRIEND_REQUEST_REJECT)
  async handleRejectFriendRequest(payload: FriendRequest) {
    const senderRequestSocket = this.gatway.sessions.getUserSocket(
      payload.sender.id,
    );

    senderRequestSocket &&
      senderRequestSocket.emit('onFriendRequestRejected', payload);
  }
}
