/* eslint-disable no-magic-numbers */
/* eslint-disable unicorn/consistent-function-scoping */
import { FastifyInstance } from 'fastify';
import StatusCodes from 'http-status-codes';
import moment from 'moment';
import { Sequelize } from 'sequelize';
import { parseEnvironment } from '../../../src/server/utils/environment-parser';
import { setupDatabase, setUpdatedAt, setupServer } from '../utils/test-utils';
import {
  createCosigner,
  createWallet,
  defaultCosigner,
  getWallet,
  joinWallet,
  signTransaction,
  testCreateWallet,
  testNewTransaction
} from './wallet-test-utils';

describe('/wallets/{walletId} endpoint', () => {
  let database: Sequelize;
  let server: FastifyInstance;
  let enableSync: boolean;
  let expirationTime: number;
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

  const testWalletPendingTxs = async (walletId: string, expectedPendingTxs: number): Promise<void> => {
    const walletState = await getWallet(server, walletId);
    expect(walletState.statusCode).toBe(StatusCodes.OK);
    expect(walletState.json()).toHaveProperty('pendingTxs');
    expect(walletState.json().pendingTxs).toBe(expectedPendingTxs);
  };

  test('should return pendingTxs when there are transactions in WaitingForSignatures state', async () => {
    const walletId = await testCreateWallet(server);

    const secondCosigner = createCosigner('secondCosigner');
    await joinWallet(server, walletId, secondCosigner);
    await joinWallet(server, walletId, createCosigner('thirdCosigner'));

    await testWalletPendingTxs(walletId, 0);

    const firstTransaction = await testNewTransaction(server, walletId);
    await testWalletPendingTxs(walletId, 1);

    const secondTransaction = await testNewTransaction(server, walletId);
    await testWalletPendingTxs(walletId, 2);

    const signResponse = await signTransaction(server, firstTransaction, {
      issuer: secondCosigner.pubKey,
      witness: 'someWitness'
    });
    expect(signResponse.statusCode).toBe(StatusCodes.OK);
    expect(signResponse.json()).toHaveProperty('transactionState');
    expect(signResponse.json().transactionState).toBe('Signed');
    await testWalletPendingTxs(walletId, 1);

    const simulatedDate = moment()
      .subtract(expirationTime, 'minutes')
      .subtract(expirationTime, 'seconds') // ensure extra time
      .toDate();
    await setUpdatedAt(database, 'transactions', secondTransaction, simulatedDate);
    // second transaction is Expired now and should not be taken as pending
    await testWalletPendingTxs(walletId, 0);
  });
});
