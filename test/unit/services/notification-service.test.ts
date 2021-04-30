/* eslint-disable no-new */
import * as http from 'http';
import { Sequelize } from 'sequelize/types';
import { io, Socket } from 'socket.io-client';
import { NotificationService } from '../../../src/server/services/notification-service';
import { Environment, parseEnvironment } from '../../../src/server/utils/environment-parser';
import { setupDatabase } from '../../e2e/utils/test-utils';

let environment: Environment;
let database: Sequelize;
let socket: Socket;
let httpServer: http.Server;

beforeAll(async done => {
  environment = parseEnvironment();
  database = await setupDatabase(false);
  httpServer = http.createServer();
  new NotificationService(httpServer);
  httpServer.listen(environment.PORT);
  done();
});

afterAll(async done => {
  await database.close();
  httpServer.close();
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
  if (socket?.connected) {
    socket.disconnect();
  }
  done();
});

describe('/notifications endpoint and subscribe to events', () => {
  it('should connect socket', () => {
    expect(socket?.connected).toBeTruthy();
  });
});
