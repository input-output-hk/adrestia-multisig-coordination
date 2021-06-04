/* eslint-disable quotes */
/* eslint-disable no-magic-numbers */
import { FastifyInstance } from 'fastify';
import StatusCodes from 'http-status-codes';
import { Sequelize } from 'sequelize';
import { setupDatabase, setupServer } from '../utils/test-utils';
import { sendMessageToChannel } from '../utils/message-utils';

describe('Server test', () => {
  let database: Sequelize;
  let server: FastifyInstance;
  const defaultMessage = {
    channelId: 'a-channel',
    message: 'AA'
  };

  beforeAll(async () => {
    database = await setupDatabase(false);
    server = setupServer(database);
  });

  afterAll(async () => {
    await database.close();
  });

  test('should return an error if there is db connection problem', async () => {
    // Perfom action with server 1
    const { channelId, message } = defaultMessage;

    const firstRequest = await sendMessageToChannel(server, { channelId, message });

    expect(firstRequest).toHaveProperty('statusCode', StatusCodes.OK);
    expect(firstRequest.json()).toHaveProperty('message');

    await database.close();

    // Perfom action with server 2
    const secondRequest = await sendMessageToChannel(server, { channelId, message });

    expect(secondRequest).toHaveProperty('statusCode', StatusCodes.INTERNAL_SERVER_ERROR);
  });
});
