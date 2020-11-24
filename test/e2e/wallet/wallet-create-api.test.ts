/* eslint-disable no-magic-numbers */
import { FastifyInstance } from 'fastify';
import StatusCodes from 'http-status-codes';
import { Pool } from 'pg';
import { Errors } from '../../../src/server/utils/errors';
import { setupDatabase, setupServer } from '../utils/test-utils';

describe('/wallets endpoint', () => {
  let database: Pool;
  let server: FastifyInstance;
  beforeAll(async () => {
    database = setupDatabase(false);
    server = setupServer(database);
  });

  afterAll(async () => {
    await database.end();
  });

  test('should return the wallet id', async () => {
    const response = await server.inject({
      method: 'post',
      url: '/wallets',
      payload: {
        walletName: 'someName',
        m: 2,
        n: 3,
        cosigner: {
          cosignerAlias: 'someAlias',
          pubKey: 'someValidKey'
        }
      }
    });

    expect(response.statusCode).toEqual(StatusCodes.OK);
    expect(response.json()).toHaveProperty('walletId');
  });

  test('should return error if m is greater than n', async () => {
    const response = await server.inject({
      method: 'post',
      url: '/wallets',
      payload: {
        walletName: 'someName',
        m: 3,
        n: 2,
        cosigner: {
          cosignerAlias: 'someAlias',
          pubKey: 'someValidKey'
        }
      }
    });

    expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    expect(response.json().message).toBe(Errors.INVALID_WALLET_INPUT_M_SMALLER_N.message);
  });

  test('should return error if walletName is empty', async () => {
    const response = await server.inject({
      method: 'post',
      url: '/wallets',
      payload: {
        walletName: '',
        m: 2,
        n: 3,
        cosigner: {
          cosignerAlias: 'someAlias',
          pubKey: 'someValidKey'
        }
      }
    });

    expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    expect(response.json().message).toBe(Errors.WALLET_NAME_EMPTY.message);
  });

  test('should return error if m is smaller than 1', async () => {
    const response = await server.inject({
      method: 'post',
      url: '/wallets',
      payload: {
        walletName: 'someName',
        m: 0,
        n: 3,
        cosigner: {
          cosignerAlias: 'someAlias',
          pubKey: 'someValidKey'
        }
      }
    });

    expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    expect(response.json().message).toBe(Errors.INVALID_WALLET_INPUT_M.message);
  });

  test('should return error if pubKey is not valid', async () => {
    const response = await server.inject({
      method: 'post',
      url: '/wallets',
      payload: {
        walletName: 'someName',
        m: 2,
        n: 3,
        cosigner: {
          cosignerAlias: 'someAlias',
          pubKey: ''
        }
      }
    });

    expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    expect(response.json().message).toBe(Errors.INVALID_PUBKEY.message);
  });
});
