/* eslint-disable no-console */
import http from 'http';
import { Server, Socket } from 'socket.io';

type ChannelId = Components.Schemas.ChannelId;

export enum SocketEvent {
  NewMessage = 'new_message',
  Subscribe = 'subscribe'
}

export enum SuccessMessage {
  Subscribed = 'USER_SUBSCRIBED'
}

export type SocketResponse = {
  channelId: ChannelId;
  message: SuccessMessage;
};

const channelQuery = (id: ChannelId) => `channel:${id}`;

export class NotificationService {
  private io: Server;

  constructor(httpServer: http.Server) {
    this.io = new Server(httpServer, { path: '/notifications' });
    this.io.on('connection', async (socket: Socket) => {
      socket.on(SocketEvent.Subscribe, ({ channelId }) => {
        const channelName = channelQuery(channelId);
        socket.join(channelName);
        socket.emit(SocketEvent.Subscribe, { channelId, message: SuccessMessage.Subscribed });
      });
    });
  }

  public async sendMessageToChannel(channelId: ChannelId, message: Components.Schemas.Message): Promise<void> {
    const channelName = channelQuery(channelId);
    this.io.to(channelName).emit(SocketEvent.NewMessage, message);
  }
}

const configure = (httpServer: http.Server): NotificationService => new NotificationService(httpServer);

export default configure;
