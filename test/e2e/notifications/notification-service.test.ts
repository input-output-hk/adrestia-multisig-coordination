/* eslint-disable no-new */
import { FastifyInstance } from 'fastify';
import { Sequelize } from 'sequelize/types';
import { io, Socket } from 'socket.io-client';
import { MessageAttributes } from '../../../src/server/model/message';
import { SocketEvent, SocketResponse, SuccessMessage } from '../../../src/server/services/notification-service';
import { Environment, parseEnvironment } from '../../../src/server/utils/environment-parser';
import { sendMessageToChannel } from '../utils/message-utils';
import { setupDatabase, setupServer } from '../utils/test-utils';

let environment: Environment;
let database: Sequelize;
let socket: Socket;
let server: FastifyInstance;

const defaultMessage: MessageAttributes = {
  channelId: 'new_channel',
  message: '00'
};

describe('/notifications endpoint and subscribe to events', () => {
  beforeAll(async done => {
    environment = parseEnvironment();
    database = await setupDatabase(false);
    server = setupServer(database);
    server.server.listen(environment.PORT);
    done();
  });

  afterAll(async done => {
    await database.close();
    await server.close();
    server.server.close();
    socket.close();
    done();
  });

  beforeEach(done => {
    socket = io(`http://localhost:${environment.PORT}`, {
      path: '/notifications',
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 0,
      forceNew: true
    });
    socket.on('connect', () => {
      done();
    });
  });

  afterEach(done => {
    if (socket.connected) socket.disconnect();
    done();
  });

  it('should connect socket', () => {
    expect(socket?.connected).toBeTruthy();
  });

  it('should subscribe to channel', async done => {
    const { channelId } = defaultMessage;

    socket.once(SocketEvent.Subscribe, (response: SocketResponse) => {
      expect(response).toHaveProperty('channelId', channelId);
      expect(response).toHaveProperty('message', SuccessMessage.Subscribed);
      done();
    });

    socket.emit(SocketEvent.Subscribe, { channelId });
  });

  it('should receive confirmation response when subscribe to channel', async done => {
    const channelId = 'A';

    socket.on(SocketEvent.Subscribe, (response: SocketResponse) => {
      expect(response).toHaveProperty('channelId', channelId);
      done();
    });

    socket.emit(SocketEvent.Subscribe, { channelId });
  });

  it('should receive corresponding messages when subscribed to channel', async done => {
    const channelId = 'A';
    const message = '123456ADCBDE';

    socket.once(SocketEvent.NewMessage, (response: Components.Schemas.Message) => {
      expect(response).toBe(message);
      done();
    });

    socket.emit(SocketEvent.Subscribe, { channelId });

    let request = await sendMessageToChannel(server, { channelId, message });
    request = request.json();
    expect(request).toHaveProperty('channelId', channelId);
    expect(request).toHaveProperty('createdAt');
  });
});
