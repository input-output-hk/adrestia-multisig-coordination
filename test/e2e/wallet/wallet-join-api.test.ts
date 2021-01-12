/* eslint-disable no-magic-numbers */
import { FastifyInstance } from 'fastify';
import StatusCodes from 'http-status-codes';
import { Sequelize } from 'sequelize';
import { CoSigner, WalletId } from '../../../src/server/models';
import { parseEnvironment } from '../../../src/server/utils/environment-parser';
import { setupDatabase, setupServer } from '../utils/test-utils';
import {
  createCosigner,
  createWallet,
  defaultCosigner,
  getWallet,
  joinWallet,
  testCreateExpiredWallet,
  testCreateWallet
} from './wallet-test-utils';

describe('/wallets/{walletId}/join endpoint', () => {
  let database: Sequelize;
  let server: FastifyInstance;
  let expirationTime: number;
  let enableSync: boolean;
  beforeAll(async () => {
    database = await setupDatabase(false);
    server = setupServer(database);
    const environment = parseEnvironment();
    enableSync = environment.ENABLE_SYNC;
    expirationTime = environment.EXPIRATION_TIME;
  });

  afterAll(async () => {
    await database.close();
  });

  beforeEach(async () => {
    if (enableSync) await database.sync({ force: true });
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
    expect(walletWithCosigner.json()).toHaveProperty('state');
    expect(walletWithCosigner.json().state).toBe('WaitingForCosigners');
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

  test('should return error when trying to join an expired wallet', async () => {
    const walletId = await testCreateExpiredWallet(server, database, expirationTime);

    const joinResponse = await joinWallet(server, walletId, createCosigner('secondCosigner'));
    expect(joinResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
  });
});
