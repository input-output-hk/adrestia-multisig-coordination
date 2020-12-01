/* eslint-disable no-magic-numbers */
import { FastifyInstance } from 'fastify';
import StatusCodes from 'http-status-codes';
import { Pool } from 'pg';
import { CoSigner, WalletId } from '../../../src/server/models';
import { setupDatabase, setupServer } from '../utils/test-utils';
import {
  createCosigner,
  createWallet,
  defaultCosigner,
  getWallet,
  joinWallet,
  testCreateWallet
} from './wallet-test-utils';

describe('/wallets/{walletId}/join endpoint', () => {
  let database: Pool;
  let server: FastifyInstance;
  beforeAll(async () => {
    database = setupDatabase(false);
    server = setupServer(database);
  });

  afterAll(async () => {
    await database.end();
  });

  test('should return the wallet state after join', async () => {
    const walletId: WalletId = await testCreateWallet(server);

    const cosigner: CoSigner = createCosigner('anotherCosigner');
    const walletState = await joinWallet(server, walletId, cosigner);

    expect(walletState.statusCode).toEqual(StatusCodes.OK);
    expect(walletState.json()).toHaveProperty('walletState');
    expect(walletState.json().walletState).toBe('WaitingForCosigners');
  });

  test('should be part of cosigners after join', async () => {
    const walletId: WalletId = await testCreateWallet(server);

    const cosigner: CoSigner = createCosigner('anotherCosigner');
    const walletState = await joinWallet(server, walletId, cosigner);

    expect(walletState.statusCode).toEqual(StatusCodes.OK);
    expect(walletState.json()).toHaveProperty('walletState');
    expect(walletState.json().walletState).toBe('WaitingForCosigners');

    const walletWithCosigner = await getWallet(server, walletId);

    expect(walletWithCosigner.statusCode).toEqual(StatusCodes.OK);
    expect(walletWithCosigner.json()).toHaveProperty('walletState');
    expect(walletWithCosigner.json().walletState).toBe('WaitingForCosigners');
    expect(walletWithCosigner.json()).toHaveProperty('pendingTxs');
    expect(walletWithCosigner.json()).toHaveProperty('cosigners');
    expect(walletWithCosigner.json().cosigners).toContainEqual(defaultCosigner);
    expect(walletWithCosigner.json().cosigners).toContainEqual(cosigner);
    expect(walletWithCosigner.json().cosigners).toHaveLength(2);
  });

  test('should return ready state when wallet is full', async () => {
    const walletId: WalletId = await testCreateWallet(server);

    const cosigner: CoSigner = createCosigner('firstCosigner');
    let walletState = await joinWallet(server, walletId, cosigner);

    expect(walletState.statusCode).toEqual(StatusCodes.OK);
    expect(walletState.json()).toHaveProperty('walletState');
    expect(walletState.json().walletState).toBe('WaitingForCosigners');

    const anotherCosigner: CoSigner = createCosigner('secondCosigner');

    walletState = await joinWallet(server, walletId, anotherCosigner);

    expect(walletState.statusCode).toEqual(StatusCodes.OK);
    expect(walletState.json()).toHaveProperty('walletState');
    expect(walletState.json().walletState).toBe('Ready');
  });

  test('should return error when cosigner joining twice', async () => {
    const response = await createWallet(server);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    expect(response.json()).toHaveProperty('walletId');

    const walletId: string = response.json().walletId;
    const cosigner: CoSigner = createCosigner('firstCosigner');

    let walletState = await joinWallet(server, walletId, cosigner);

    expect(walletState.statusCode).toEqual(StatusCodes.OK);
    expect(walletState.json()).toHaveProperty('walletState');
    expect(walletState.json().walletState).toBe('WaitingForCosigners');

    walletState = await joinWallet(server, walletId, cosigner);

    expect(walletState.statusCode).toEqual(StatusCodes.BAD_REQUEST);
  });

  test('should return error when wallet is full', async () => {
    const response = await createWallet(server);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    expect(response.json()).toHaveProperty('walletId');

    const walletId: string = response.json().walletId;

    await joinWallet(server, walletId, createCosigner('firstCosigner'));
    let walletState = await joinWallet(server, walletId, createCosigner('secondCosigner'));

    expect(walletState.statusCode).toEqual(StatusCodes.OK);
    expect(walletState.json()).toHaveProperty('walletState');
    expect(walletState.json().walletState).toBe('Ready');

    walletState = await joinWallet(server, walletId, createCosigner('thirdCosigner'));

    expect(walletState.statusCode).toEqual(StatusCodes.BAD_REQUEST);
  });
});
