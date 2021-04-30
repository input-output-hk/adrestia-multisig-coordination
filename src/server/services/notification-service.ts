import * as http from 'http';
import { Server, Socket } from 'socket.io';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SubscribeResponse = 'Channel not found' | any;
export interface NewMessage {
  message: string;
}

enum SocketMessage {
  NewMessage = 'new_message',
  Subscribe = 'subscribe'
}

type MessageTypes = SubscribeResponse | NewMessage;

type SocketActionFn<T> = (socket: Socket) => (message: T) => void;

interface WrappedServerSocket<T> {
  event: string;
  callback: SocketActionFn<T>;
}

export class NotificationService {
  private io: Server;

  constructor(httpServer: http.Server) {
    this.io = new Server(httpServer, { path: '/notifications' });
    this.io.on('connection', async (socket: Socket) => {
      this.registerEvents().forEach(({ event, callback }) => {
        socket.on(event, callback(socket));
      });
    });
  }

  private createSocket<T>(event: SocketMessage, callback: SocketActionFn<T>): WrappedServerSocket<T> {
    return { event, callback };
  }

  private emit(to: Server | Socket, event: SocketMessage, data: MessageTypes) {
    to.emit(event, data);
  }

  private registerEvents() {
    const subscribeMessageEvent = this.createSocket<SocketMessage>(
      SocketMessage.Subscribe,
      socket => async subscribeMessage => {
        socket.join('channel id');
      }
    );
    return [subscribeMessageEvent];
  }
}

const configure = (httpServer: http.Server): NotificationService => new NotificationService(httpServer);

export default configure;
