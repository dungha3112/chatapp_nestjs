import { Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { IConversationsServices } from 'src/conversations/conversations';
import { Services } from 'src/utils/constants';
import { AuthenticatedSocket } from 'src/utils/interfaces';
import { Conversation, Group } from 'src/utils/typeorm';
import {
  CreateGroupMessageResponse,
  CreateMessageResponse,
  DeleteMessageResponse,
  EditMessageResponse,
} from 'src/utils/types';
import { IGatewaySessionManager } from './gateway.session';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173'],
    credentials: true,
  },
  pingInterval: 25000,
  pingTimeout: 60000,
})
export class MessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
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

  handleDisconnect(socket: AuthenticatedSocket) {
    console.log('disconnected ...');
    console.log(`${socket.user.email} disconnected.`);
    this.sessions.removeUserSocket(socket.user.id);
  }

  @SubscribeMessage('onConnect')
  handleOnConnect(@ConnectedSocket() client: AuthenticatedSocket) {
    this.sessions.setUserSocket(client.user.id, client);
  }

  /**
   * --------------------------------------------------------------------------------------------
   *                                CONVERSATION
   * --------------------------------------------------------------------------------------------
   */
  // get emit onConversationJoin from client side
  // get emit from ConversationPage.tsx
  // data  : {conversationId: number}
  @SubscribeMessage('onConversationJoin')
  onConversationJoin(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    console.log(`conversation join`, { data });

    client.join(`conversation-${data.conversationId}`);
    console.log(client.rooms);

    client
      .to(`conversation-${data.conversationId}`)
      .emit('userJoinToClientSide');
  }

  // get emit onConversationLeave from client side
  // data  : {conversationId: number}
  @SubscribeMessage('onConversationLeave')
  onConversationLeave(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    console.log('onConversationLeave start');
    console.log(client.rooms);
    console.log('onConversationLeave end');

    client.leave(`conversation-${data.conversationId}`);
    console.log(client.rooms);

    client
      .to(`conversation-${data.conversationId}`)
      .emit('userLeaveToClientSide');
  }

  /**
   * --------------------------------------------------------------------------------------------
   *                                USER TYPING MESSAGE
   * --------------------------------------------------------------------------------------------
   */
  // get emit onTypingStart from client side
  // data  : {conversationId: number}
  @SubscribeMessage('onTypingStart')
  onTypingStart(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { conversationId } = data;
    console.log('onTypingStart ----', { conversationId });

    client.to(conversationId).emit('onTypingStartToClientSide', {
      conversationId,
      userId: client.user.id,
    });
    this.server.to(conversationId).emit('onTypingStartToClientSide', {
      conversationId,
      userId: client.user.id,
    });
  }

  // get emit onTypingStop from client side
  // data  : {conversationId: number}
  @SubscribeMessage('onTypingStop')
  onTypingStop(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { conversationId } = data;

    console.log(' ---- onTypingStop ----', { conversationId });

    client.to(conversationId).emit('onTypingStopToClientSide', {
      conversationId,
      userId: client.user.id,
    });
    this.server.to(conversationId).emit('onTypingStopToClientSide', {
      conversationId,
      userId: client.user.id,
    });
  }

  // get socket emit conversation.create from convesations.controller
  // and send socket to client side
  @OnEvent('conversation.create')
  handleConversationCreateEvent(payload: Conversation) {
    const recipientSocket = this.sessions.getUserSocket(payload.recipient.id);
    if (recipientSocket)
      recipientSocket.emit('onConversationCreateToClientSide', payload);
  }

  /**
   * --------------------------------------------------------------------------------------------
   *                                MESSAGE
   * --------------------------------------------------------------------------------------------
   */
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
  async handleMessageDeleteEvent(payload: DeleteMessageResponse) {
    const { message, userId } = payload;

    const conversation = await this.conversationServices.findById(
      message.conversation.id,
    );
    if (!conversation) return;

    const { creator, recipient } = conversation;

    const recipientId = creator.id === userId ? recipient.id : creator.id;

    const recipientSocket = this.sessions.getUserSocket(recipientId);
    if (recipientSocket)
      recipientSocket.emit('onMessageDeleteToClientSide', message);
  }

  // get socket emit message.edit from messages.controller
  // and send socket to client side
  @OnEvent('message.edit')
  async handleMessageEditEvent(payload: EditMessageResponse) {
    const { message, userId } = payload;

    const conversation = await this.conversationServices.findById(
      message.conversation.id,
    );
    if (!conversation) return;

    const { creator, recipient } = conversation;
    const recipientId = creator.id === userId ? recipient.id : creator.id;
    const recipientSocket = this.sessions.getUserSocket(recipientId);

    if (recipientSocket)
      recipientSocket.emit('onMessageEditToClientSide', message);
  }

  /**
   * --------------------------------------------------------------------------------------------
   *                                GROUP
   * --------------------------------------------------------------------------------------------
   */

  /**
   * Conversation
   * @param data
   * @param client
   */
  // get emit onGroupJoin from client side
  // data  : {groupId: number}
  @SubscribeMessage('onGroupJoin')
  onGroupJoin(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    console.log(`onGroupJoin join`, { data });

    client.join(`group-${data.groupId}`);
    console.log(client.rooms);

    client.to(`conversation-${data.groupId}`).emit('userJoinToClientSide');
  }

  // get emit onGroupLeave from client side
  // data  : {groupId: number}
  @SubscribeMessage('onGroupLeave')
  onGroupLeave(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    console.log('onGroupLeave start');
    console.log(client.rooms);
    console.log('onGroupLeave end');

    client.leave(`conversation-${data.groupId}`);
    console.log(client.rooms);

    client.to(`conversation-${data.groupId}`).emit('userLeaveToClientSide');
  }

  // get socket emit group.create from group.controoler
  @OnEvent('group.create')
  async handleGroupCreateEvent(payload: Group) {
    console.log('group.create event');

    payload.users.forEach((user) => {
      const socket = this.sessions.getUserSocket(user.id);
      socket && socket.emit(`onGroupCreateToClient`, payload);
    });
  }

  // get socket emit group.message.create from group-messages.controoler
  @OnEvent('group.message.create')
  async handleGroupMessageCreateEvent(payload: CreateGroupMessageResponse) {
    const { id } = payload.group;
    console.log('Inside group.message.create');

    this.server.to(`group-${id}`).emit('onGroupMessageToClient', payload);
  }
}
