/* eslint-disable no-magic-numbers */
import { FastifyInstance } from 'fastify';
import StatusCodes from 'http-status-codes';
import { Pool } from 'pg';
import { setupDatabase, setupServer } from '../utils/test-utils';

describe('Server test', () => {
  let database: Pool;
  let server: FastifyInstance;
  beforeAll(async () => {
    database = setupDatabase(false);
    server = setupServer(database);
  });

  afterAll(async () => {
    await database.end();
  });

  test('should return a generic error if payload is not valid', async () => {
    const response = await server.inject({
      method: 'post',
      url: '/sample',
      payload: { asdasa: 10 }
    });

    expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    // eslint-disable-next-line quotes
    expect(response.json().message).toEqual("body should have required property 'param'");
  });

  // Implement when using the db
  test.skip('should return a generic error if there is db connection problem', async () => {
    await database.end();
    const response = await server.inject({
      method: 'post',
      url: '/sample',
      payload: { param: 'Hi!' }
    });

    expect(response.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.json()).toEqual('');
  });
});
