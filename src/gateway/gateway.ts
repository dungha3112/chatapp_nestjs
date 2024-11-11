import { OnEvent } from '@nestjs/event-emitter';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173'],
    credentials: true,
  },
})
export class MessagingGateway implements OnGatewayConnection {
  handleConnection(socket: Socket, ...args: any[]) {
    socket.emit('connected', {});
  }

  @WebSocketServer() server: Server;

  // get socket message.create from messages.controller
  // and send socket to client side
  @OnEvent('message.create')
  handleMessageCreateEvent(payload: any) {
    this.server.emit('createMessageToClientSide', payload);
  }
}
