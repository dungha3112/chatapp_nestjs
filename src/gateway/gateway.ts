import { AuthenticatedSocket } from 'src/utils/interfaces';
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
import { Conversation, Group, GroupMessage, Message } from 'src/utils/typeorm';
import {
  AddGroupUserResponse,
  CreateGroupMessageResponse,
  CreateMessageResponse,
  DeleteGroupMessageResponse,
  DeleteMessageResponse,
  RemoveGroupRecipientResponse,
} from 'src/utils/types';
import { IGatewaySessionManager } from './gateway.session';
import { IGroupServices } from 'src/group/interfaces/group';
import { IFriendsServices } from 'src/friends/friends';

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
  public readonly sessions: IGatewaySessionManager;

  @Inject(Services.CONVERSATIONS)
  private readonly conversationServices: IConversationsServices;

  @Inject(Services.GROUPS)
  private readonly groupServices: IGroupServices;

  @Inject(Services.FRIENDS)
  private readonly friendsService: IFriendsServices;

  // server: Server from package, to emit to client side
  @WebSocketServer()
  server: Server;

  handleConnection(socket: AuthenticatedSocket, ...args: any[]) {
    console.log(`Incoming Connection: ${socket.user.username}`);
    this.sessions.setUserSocket(socket.user.id, socket);
    socket.emit('connected', {});
  }

  handleDisconnect(socket: AuthenticatedSocket) {
    console.log('disconnected ...');
    console.log(`${socket.user.username} disconnected.`);
    socket.rooms.forEach((room) => {
      if (room !== socket.id) {
        socket.leave(room);
      }
    });
    this.sessions.removeUserSocket(socket.user.id);
  }

  @SubscribeMessage('onConnect')
  handleOnConnect(@ConnectedSocket() client: AuthenticatedSocket) {
    this.sessions.setUserSocket(client.user.id, client);
  }

  /**
   * user online or offline
   * MessageBody : {groupId}: number
   */
  @SubscribeMessage('getOnlineGroupUsers')
  async handleGetOnlineGroupUsers(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { groupId } = data;
    const group = await this.groupServices.findGroupById(parseInt(groupId));

    if (!group) return;

    const onlineUserIds = new Set(this.sessions.getAllOnlineUserIds());

    const onlineUsers = group.users.filter((user) =>
      onlineUserIds.has(user.id),
    );
    const offlineUsers = group.users.filter(
      (user) => !onlineUserIds.has(user.id),
    );

    // client.emit('onlineGroupUsersReceived', { onlineUsers, offlineUsers });
    this.server
      .to(`group-${groupId}`)
      .emit('onlineGroupUsersReceived', { onlineUsers, offlineUsers });
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
    const { conversationId } = data;

    console.log('client.rooms join', client.rooms, 'conversation join', {
      data,
    });

    client.join(`conversation-${conversationId}`);

    client.to(`conversation-${conversationId}`).emit('userConversationJoin');
  }

  // get emit onConversationLeave from client side
  // data  : {conversationId: number}
  @SubscribeMessage('onConversationLeave')
  onConversationLeave(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    console.log('client.rooms leave', client.rooms);

    client.leave(`conversation-${data.conversationId}`);

    client.to(`conversation-${data.conversationId}`).emit('userLeave');
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

    client.to(`conversation-${conversationId}`).emit('onTypingStart', {
      conversationId,
      user: {
        id: client.user.id,
        firstName: client.user.firstName,
        lastName: client.user.lastName,
      },
    });
    this.server.to(`conversation-${conversationId}`).emit('onTypingStart', {
      conversationId,
      user: {
        id: client.user.id,
        firstName: client.user.firstName,
        lastName: client.user.lastName,
      },
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

    client.to(`conversation-${conversationId}`).emit('onTypingStop', {
      conversationId,
      user: {
        id: client.user.id,
        firstName: client.user.firstName,
        lastName: client.user.lastName,
      },
    });
    this.server.to(`conversation-${conversationId}`).emit('onTypingStop', {
      conversationId,
      user: {
        id: client.user.id,
        firstName: client.user.firstName,
        lastName: client.user.lastName,
      },
    });
  }

  // get socket emit conversation.create from convesations.controller
  // and send socket to client side
  @OnEvent('conversation.create')
  handleConversationCreateEvent(payload: Conversation) {
    const recipientSocket = this.sessions.getUserSocket(payload.recipient.id);
    if (recipientSocket) recipientSocket.emit('onConversationCreate', payload);
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

    if (authSocket) authSocket.emit('onMessageCreate', payload);

    if (recipientSocket) recipientSocket.emit('onMessageCreate', payload);
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
    if (recipientSocket) recipientSocket.emit('onMessageDelete', message);
  }

  // get socket emit message.edit from messages.controller
  // and send socket to client side
  @OnEvent('message.edit')
  async handleMessageEditEvent(message: Message) {
    const {
      author,
      conversation: { recipient, creator },
    } = message;

    const recipientSocket =
      author.id === creator.id
        ? this.sessions.getUserSocket(recipient.id)
        : this.sessions.getUserSocket(creator.id);

    if (recipientSocket) recipientSocket.emit(`onMessageEdit`, message);
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
    console.log('group join', client.rooms);

    client.to(`group-${data.groupId}`).emit('userGroupJoin');
  }

  // get emit onGroupLeave from client side
  // data  : {groupId: number}
  @SubscribeMessage('onGroupLeave')
  onGroupLeave(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.leave(`group-${data.groupId}`);
    client.to(`group-${data.groupId}`).emit('userLeave');
  }

  // get socket emit group.create from group.controoler
  @OnEvent('group.create')
  async handleGroupCreateEvent(payload: Group) {
    const ownerId = payload.owner.id;

    const socketIds: string[] = [];
    payload.users.forEach((user) => {
      if (user.id !== ownerId) {
        const socket = this.sessions.getUserSocket(user.id);
        if (socket) socketIds.push(socket.id);
      }
    });

    if (socketIds.length > 0) {
      this.server.to(socketIds).emit('onGroupCreate', payload);
    }
  }

  ////////////////////////////////////////// Group message ///////////////////////////////////
  // get socket emit group.message.create from group-messages.controller
  @OnEvent('group.message.create')
  async handleGroupMessageCreateEvent(payload: CreateGroupMessageResponse) {
    const { id } = payload.group;

    const group = await this.groupServices.findGroupById(id);
    if (!group) return;
    const ROM = `group-${id}`;
    this.server.to(ROM).emit('onGroupMessage', payload);
  }

  // get socket emit group.message.delete from groups-messages.controller.ts
  @OnEvent('group.message.delete')
  async handleGroupMessageDeleteEvent(payload: DeleteGroupMessageResponse) {
    const { userId, message } = payload;

    const group = await this.groupServices.findGroupById(message.group.id);
    if (!group) return;

    const ROM = `group-${message.group.id}`;
    this.server.to(ROM).emit('onGroupMessageDelete', message);
  }

  // group.message.update
  //onGroupMessageEdit
  @OnEvent('group.message.update')
  async handleGroupMessageEditEvent(payload: GroupMessage) {
    const group = await this.groupServices.findGroupById(payload.group.id);
    if (!group) return;

    const ROM = `group-${group.id}`;
    this.server.to(ROM).emit('onGroupMessageEdit', payload);
  }

  /**
   * GROUP RECIPIENT
   *
   */

  //group.add.user
  @OnEvent('group.user.add')
  handleGroupUserAdd(payload: AddGroupUserResponse) {
    const { group, user } = payload;

    const ROM_NAME = `group-${group.id}`;
    this.server.to(ROM_NAME).emit('onGroupReceivedNewUser', group);

    const recipientSocket = this.sessions.getUserSocket(user.id);
    recipientSocket && recipientSocket.emit('onGroupUserAdd', group);
  }

  //group.owner.update
  @OnEvent('group.owner.update')
  handleUpdateGroupOwner(payload: Group) {
    const room = `group-${payload.id}`;
    this.server.to(room).emit('onGroupOwnerUpdate', payload);
  }

  //group.user.remove
  @OnEvent('group.user.remove')
  async handleGroupRemoveUser(payload: RemoveGroupRecipientResponse) {
    const { group, user } = payload;
    const ROM_NAME = `group-${group.id}`;
    const removedUserSocket = this.sessions.getUserSocket(user.id);

    await this.handleGetOnlineGroupUsers(
      { groupId: group.id },
      removedUserSocket,
    );
    this.server.to(ROM_NAME).emit('onGroupRecipientRemoved', group);

    if (removedUserSocket) {
      removedUserSocket.emit('onGroupUserRemoved', group);

      removedUserSocket.leave(ROM_NAME);
    }

    // send socket to all user in group
    // when online group socket emit from client side, => change group.users
  }

  @OnEvent('group.user.leave')
  async handleGroupUserLeave(payload) {
    const { group, userId }: { group: Group; userId: number } = payload;

    const ROOM_NAME = `group-${group.id}`;
    const { rooms } = this.server.sockets.adapter;

    const socketInRoom = rooms.get(ROOM_NAME);
    const leftUserSocket = this.sessions.getUserSocket(userId);

    if (leftUserSocket && socketInRoom) {
      if (socketInRoom.has(leftUserSocket.id)) {
        return this.server.to(ROOM_NAME).emit('onGroupParticipantLeft', group);
      } else {
        leftUserSocket.emit('onGroupParticipantLeft', payload);
        this.server.to(ROOM_NAME).emit('onGroupParticipantLeft', payload);
        return;
      }
    }

    if (leftUserSocket && !socketInRoom) {
      return leftUserSocket.emit('onGroupParticipantLeft', payload);
    }

    await this.handleGetOnlineGroupUsers({ groupId: group.id }, leftUserSocket);
  }

  // get from client
  @SubscribeMessage('getOnlineFriends')
  async handleFriendListRetrieve(
    @MessageBody() data: any,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const { user } = socket;

    if (user) {
      const friends = await this.friendsService.getFriends(user.id);

      const onlineFriends = friends.filter((friend) =>
        this.sessions.getUserSocket(
          user.id === friend.receiver.id
            ? friend.sender.id
            : friend.receiver.id,
        ),
      );
      socket.emit('getOnlineFriends', onlineFriends);
    }
  }
}
