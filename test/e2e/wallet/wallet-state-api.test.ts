/* eslint-disable no-magic-numbers */
import { FastifyInstance } from 'fastify';
import StatusCodes from 'http-status-codes';
import { Sequelize } from 'sequelize';
import { setupDatabase, setupServer } from '../utils/test-utils';
import { createWallet, defaultCosigner, getWallet } from './wallet-test-utils';

describe('/wallets/{walletId} endpoint', () => {
  let database: Sequelize;
  let server: FastifyInstance;
  beforeAll(async () => {
    database = await setupDatabase(false);
    server = setupServer(database);
  });

  afterAll(async () => {
    await database.close();
  });

  beforeEach(async () => {
    await database.sync({ force: true });
  });

  test('should return the wallet state', async () => {
    const walletResponse = await createWallet(server);

    expect(walletResponse.statusCode).toEqual(StatusCodes.OK);
    expect(walletResponse.json()).toHaveProperty('walletId');

    const walletId: string = walletResponse.json().walletId;
    const walletStateResponse = await getWallet(server, walletId);

    expect(walletStateResponse.statusCode).toEqual(StatusCodes.OK);
    expect(walletStateResponse.json()).toHaveProperty('state');
    expect(walletStateResponse.json().state).toBe('WaitingForCosigners');
    expect(walletStateResponse.json()).toHaveProperty('pendingTxs');
    expect(walletStateResponse.json()).toHaveProperty('cosigners');
    expect(walletStateResponse.json().cosigners).toStrictEqual([defaultCosigner]);
  });

  test('should return the wallet not found', async () => {
    const response = await createWallet(server);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    expect(response.json()).toHaveProperty('walletId');

    const walletId = 'someInvalidId';
    const walletState = await getWallet(server, walletId);

    expect(walletState.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });
});
