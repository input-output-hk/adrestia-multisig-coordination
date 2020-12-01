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
      url: '/wallets',
      payload: { asdasa: 10 }
    });

    expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    // eslint-disable-next-line quotes
    expect(response.json().message).toEqual("body should have required property 'walletName'");
  });

  test('should return a generic error if there is db connection problem', async () => {
    const walletInitiator = {
      cosignerAlias: 'someAlias',
      pubKey: 'someValidKey'
    };
    const response = await server.inject({
      method: 'post',
      url: '/wallets',
      payload: {
        walletName: 'someName',
        m: 2,
        n: 3,
        cosigner: walletInitiator
      }
    });

    expect(response.statusCode).toEqual(StatusCodes.OK);
    expect(response.json()).toHaveProperty('walletId');
    const walletId: string = response.json().walletId;

    await database.end();

    const walletState = await server.inject({
      method: 'get',
      url: `/wallets/${walletId}`,
      payload: {}
    });

    expect(walletState.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
  });
});
