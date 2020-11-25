/* eslint-disable no-magic-numbers */
import { FastifyInstance } from 'fastify';
import StatusCodes from 'http-status-codes';
import { Pool } from 'pg';
import { setupDatabase, setupServer } from '../utils/test-utils';

describe('/wallets/{walletId} endpoint', () => {
  let database: Pool;
  let server: FastifyInstance;
  beforeAll(async () => {
    database = setupDatabase(false);
    server = setupServer(database);
  });

  afterAll(async () => {
    await database.end();
  });

  test('should return the wallet state', async () => {
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

    const walletState = await server.inject({
      method: 'get',
      url: `/wallets/${walletId}`,
      payload: {}
    });

    expect(walletState.statusCode).toEqual(StatusCodes.OK);
    expect(walletState.json()).toHaveProperty('walletState');
    expect(walletState.json().walletState).toBe('WaitingForCosigners');
    expect(walletState.json()).toHaveProperty('pendingTxs');
    expect(walletState.json()).toHaveProperty('cosigners');
    expect(walletState.json().cosigners).toStrictEqual([walletInitiator]);
  });

  test('should return the wallet not found', async () => {
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
    const walletId = 'someInvalidId';

    const walletState = await server.inject({
      method: 'get',
      url: `/wallets/${walletId}`,
      payload: {}
    });

    expect(walletState.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });
});
