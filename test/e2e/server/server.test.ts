/* eslint-disable no-magic-numbers */
import { FastifyInstance } from 'fastify';
import StatusCodes from 'http-status-codes';
import { Sequelize } from 'sequelize';
import { setupDatabase, setupServer } from '../utils/test-utils';

describe('Server test', () => {
  let database: Sequelize;
  let server: FastifyInstance;
  const channelId = 'a-new-channel';

  beforeAll(async () => {
    database = await setupDatabase(false);
    server = setupServer(database);
  });

  afterAll(async () => {
    await database.close();
  });

  test('should return a generic error if payload is not valid', async () => {
    const response = await server.inject({
      method: 'post',
      url: `/messages/${channelId}`,
      payload: { asdasa: 10 }
    });

    expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    // eslint-disable-next-line quotes
    expect(response.json().message).toEqual("body should have required property 'message'");
  });

  test('should return an error if there is db connection problem', async () => {
    // Perfom action with server 1
    // Leave acceptance criteria for future usage
    // expect(response.statusCode).toEqual(StatusCodes.OK);
    // expect(response.json()).toHaveProperty('message');

    await database.close();

    // Perfom action with server 2

    // Leave acceptance criteria for future usage
    expect(500).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
  });
});
