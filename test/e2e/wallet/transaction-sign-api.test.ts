/* eslint-disable no-magic-numbers */
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
  joinWallet,
  signTransaction,
  testCreateReadyWallet,
  testCreateWallet,
  testNewTransaction
} from './wallet-test-utils';

describe('/transactions/${transactionId}/sign endpoint', () => {
  let database: Sequelize;
  let server: FastifyInstance;
  let expirationTime: number;
  beforeAll(async () => {
    database = await setupDatabase(false);
    server = setupServer(database);
    expirationTime = parseEnvironment().EXPIRATION_TIME;
  });

  afterAll(async () => {
    await database.close();
  });

  beforeEach(async () => {
    await database.sync({ force: true });
  });

  test('should return error if transaction doesnt exist', async () => {
    const walletId = await testCreateWallet(server);
    await joinWallet(server, walletId, createCosigner('secondCosigner'));
    const newCosigner = createCosigner('newCosigner');
    await joinWallet(server, walletId, newCosigner);
    await testNewTransaction(server, walletId);
    const signResponse = await signTransaction(server, 'someInvalidTransactionId', { issuer: newCosigner.pubKey });
    expect(signResponse.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  test('should return error when issuer not found', async () => {
    const walletId = await testCreateReadyWallet(server);
    const transactionId = await testNewTransaction(server, walletId);

    const newCosigner = createCosigner('newCosigner');

    const signResponse = await signTransaction(server, transactionId, { issuer: newCosigner.pubKey });
    expect(signResponse.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  test('should return error when issuer invalid', async () => {
    const walletId = await testCreateReadyWallet(server);
    const transactionId = await testNewTransaction(server, walletId);

    const otherCosigner = createCosigner('otherCosigner');
    const otherWallet = await createWallet(server, {
      walletName: 'someOtherName',
      m: 2,
      n: 3,
      cosigner: otherCosigner
    });
    expect(otherWallet.statusCode).toBe(StatusCodes.OK);

    const signResponse = await signTransaction(server, transactionId, { issuer: otherCosigner.pubKey });
    expect(signResponse.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });

  test('should return error when issuer already signed', async () => {
    const walletId = await testCreateReadyWallet(server);
    const transactionId = await testNewTransaction(server, walletId);

    const signResponse = await signTransaction(server, transactionId, { issuer: defaultCosigner.pubKey });
    expect(signResponse.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });

  test('should return signed transaction', async () => {
    const walletId = await testCreateWallet(server);
    await joinWallet(server, walletId, createCosigner('secondCosigner'));
    const newCosigner = createCosigner('newCosigner');
    await joinWallet(server, walletId, newCosigner);
    const transactionId = await testNewTransaction(server, walletId);

    const signResponse = await signTransaction(server, transactionId, { issuer: newCosigner.pubKey });
    expect(signResponse.statusCode).toBe(StatusCodes.OK);
    expect(signResponse.json()).toHaveProperty('transactionState');
    expect(signResponse.json().transactionState).toBe('Signed');
  });

  test('should return error when trying to sign an expired transaction', async () => {
    const walletId = await testCreateReadyWallet(server);
    const transactionId = await testNewTransaction(server, walletId);
    const simulatedDate = moment()
      .subtract(expirationTime, 'minutes')
      .subtract(expirationTime, 'seconds')
      .toDate();
    setUpdatedAt(database, 'transactions', transactionId, simulatedDate);
    const newCosigner = createCosigner('newCosigner');
    await joinWallet(server, walletId, newCosigner);
    const signResponse = await signTransaction(server, transactionId, { issuer: newCosigner.pubKey });
    expect(signResponse.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });
});
