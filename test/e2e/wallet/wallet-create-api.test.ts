/* eslint-disable no-magic-numbers */
import { FastifyInstance } from 'fastify';
import StatusCodes from 'http-status-codes';
import { Sequelize } from 'sequelize/types';
import { parseEnvironment } from '../../../src/server/utils/environment-parser';
import { Errors } from '../../../src/server/utils/errors';
import { setupDatabase, setupServer } from '../utils/test-utils';
import { createWallet, defaultCosigner } from './wallet-test-utils';

describe('/wallets endpoint', () => {
  let database: Sequelize;
  let server: FastifyInstance;
  let enableSync: boolean;
  beforeAll(async () => {
    database = await setupDatabase(false);
    server = setupServer(database);
    enableSync = parseEnvironment().ENABLE_SYNC;
  });

  afterAll(async () => {
    await database.close();
  });

  beforeEach(async () => {
    if (enableSync) await database.sync({ force: true });
  });

  test('should return the wallet id', async () => {
    const response = await createWallet(server, {
      walletName: 'someName',
      m: 2,
      n: 3,
      cosigner: defaultCosigner
    });

    expect(response.statusCode).toEqual(StatusCodes.OK);
    expect(response.json()).toHaveProperty('walletId');
  });

  test('should return error if m is greater than n', async () => {
    const response = await createWallet(server, {
      walletName: 'someName',
      m: 3,
      n: 2,
      cosigner: defaultCosigner
    });

    expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    expect(response.json().message).toBe(Errors.INVALID_WALLET_INPUT_M_SMALLER_N.message);
  });

  test('should return error if walletName is empty', async () => {
    const response = await createWallet(server, {
      walletName: '',
      m: 2,
      n: 3,
      cosigner: defaultCosigner
    });

    expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    expect(response.json().message).toBe(Errors.WALLET_NAME_EMPTY.message);
  });

  test('should return error if m is smaller than 1', async () => {
    const response = await createWallet(server, {
      walletName: 'someName',
      m: 0,
      n: 3,
      cosigner: defaultCosigner
    });

    expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    expect(response.json().message).toBe(Errors.INVALID_WALLET_INPUT_M.message);
  });

  test('should return error if pubKey is not valid', async () => {
    const response = await createWallet(server, {
      walletName: 'someName',
      m: 2,
      n: 3,
      cosigner: {
        cosignerAlias: 'someAlias',
        pubKey: ''
      }
    });

    expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    expect(response.json().message).toBe(Errors.INVALID_PUBKEY.message);
  });
});
