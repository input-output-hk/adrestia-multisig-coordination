/* eslint-disable no-magic-numbers */
import { create } from 'domain';
import { FastifyInstance } from 'fastify';
import StatusCodes from 'http-status-codes';
import { Pool } from 'pg';
import { setupDatabase, setupServer } from '../utils/test-utils';
import { createWallet, defaultCosigner, getWallet } from './wallet-test-utils';

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
    const walletResponse = await createWallet(server);

    expect(walletResponse.statusCode).toEqual(StatusCodes.OK);
    expect(walletResponse.json()).toHaveProperty('walletId');

    const walletId: string = walletResponse.json().walletId;
    const walletStateResponse = await getWallet(server, walletId);

    expect(walletStateResponse.statusCode).toEqual(StatusCodes.OK);
    expect(walletStateResponse.json()).toHaveProperty('walletState');
    expect(walletStateResponse.json().walletState).toBe('WaitingForCosigners');
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
