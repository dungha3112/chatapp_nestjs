import { Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Services } from 'src/utils/constants';
import { AuthenticatedSocket } from 'src/utils/interfaces';
import {
  CreateMessageResponse,
  DeleteMessageParams,
  DeleteMessageResponse,
} from 'src/utils/types';
import { IGatewaySessionManager } from './gateway.session';
import { Conversation } from 'src/utils/typeorm';
import { IConversationsServices } from 'src/conversations/conversations';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173'],
    credentials: true,
  },
  pingInterval: 25000,
  pingTimeout: 60000,
})
export class MessagingGateway implements OnGatewayConnection {
  constructor() {}
  @Inject(Services.GATEWAY_SESSION_MANAGER)
  private readonly sessions: IGatewaySessionManager;

  @Inject(Services.CONVERSATIONS)
  private readonly conversationServices: IConversationsServices;

  // server: Server from package, to emit to client side
  @WebSocketServer()
  server: Server;

  handleConnection(socket: AuthenticatedSocket, ...args: any[]) {
    console.log(`Incoming Connection: ${socket.user.email}`);
    this.sessions.setUserSocket(socket.user.id, socket);
    socket.emit('connected', {});
  }

  // get emit onConversationJoin from client side
  // data  : {conversationId: number}
  @SubscribeMessage('onConversationJoin')
  onConversationJoin(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.join(data.conversationId);
    client.to(data.conversationId).emit('userJoinToClientSide');
  }

  // get emit onConversationLeave from client side
  // data  : {conversationId: number}
  @SubscribeMessage('onConversationLeave')
  onConversationLeave(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.join(data.conversationId);
    client.to(data.conversationId).emit('userLeaveToClientSide');
  }

  // get emit onTypingStart from client side
  // data  : {conversationId: number}
  @SubscribeMessage('onTypingStart')
  onTypingStart(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    console.log('onTypingStart ----');
    console.log(client.rooms);

    client.to(data.conversationId).emit('onTypingStartToClientSide');
    this.server.to(data.conversationId).emit('onTypingStartToClientSide');
  }

  // get emit onTypingStop from client side
  // data  : {conversationId: number}
  @SubscribeMessage('onTypingStop')
  onTypingStop(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    console.log('onTypingStop ----');
    console.log(client.rooms);

    client.to(data.conversationId).emit('onTypingStopToClientSide');
    this.server.to(data.conversationId).emit('onTypingStopToClientSide');
  }

  // get socket emit conversation.create from convesations.controller
  // and send socket to client side
  @OnEvent('conversation.create')
  handleConversationCreateEvent(payload: Conversation) {
    const recipientSocket = this.sessions.getUserSocket(payload.recipient.id);
    if (recipientSocket)
      recipientSocket.emit('onConversationCreateToClientSide', payload);
  }

  // get socket message.create from messages.controller
  // and send socket to client side
  @OnEvent('message.create')
  handleMessageCreateEvent(payload: CreateMessageResponse) {
    const { conversation, message } = payload;

    const authSocket = this.sessions.getUserSocket(message.author.id);
    const recipientSocket =
      message.author.id === conversation.creator.id
        ? this.sessions.getUserSocket(conversation.recipient.id)
        : this.sessions.getUserSocket(conversation.creator.id);

    if (authSocket) authSocket.emit('onMessageCreateToClientSide', payload);

    if (recipientSocket)
      recipientSocket.emit('onMessageCreateToClientSide', payload);
  }

  // get socket message.delete from messages.controller
  // and send socket to client side
  @OnEvent('message.delete')
  handleMessageDeleteEvent(payload: DeleteMessageResponse) {
    const { conversation, message, userId } = payload;

    const recipientId =
      conversation.creator.id === userId
        ? conversation.recipient.id
        : conversation.creator.id;

    const recipientSocket = this.sessions.getUserSocket(recipientId);
    if (recipientSocket)
      recipientSocket.emit('onMessageDeleteToClientSide', payload);
  }
}
