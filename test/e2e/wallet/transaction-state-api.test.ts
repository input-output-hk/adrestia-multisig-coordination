/* eslint-disable no-magic-numbers */
import { FastifyInstance } from 'fastify';
import StatusCodes from 'http-status-codes';
import { Sequelize } from 'sequelize';
import { setupDatabase, setupServer } from '../utils/test-utils';
import {
  createWallet,
  defaultCosigner,
  getTransactionProposals,
  newTransactionProposal,
  testCreateWallet
} from './wallet-test-utils';

describe('/wallets/${walletId}/proposal endpoint', () => {
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

  test('should return transaction state', async () => {
    const walletId = await testCreateWallet(server);
    const transactionResponse = await newTransactionProposal(server, walletId);

    expect(transactionResponse.statusCode).toBe(StatusCodes.OK);
    expect(transactionResponse.json()).toHaveProperty('transactionId');
    expect(transactionResponse.json()).toHaveProperty('transactionState');

    const getTransactionsResponse = await getTransactionProposals(server, walletId);
    expect(getTransactionsResponse.statusCode).toBe(StatusCodes.OK);
    expect(getTransactionsResponse.json()).toHaveLength(1);
    const firstTransaction: Components.Schemas.Transaction = getTransactionsResponse.json()[0];
    expect(firstTransaction.transactionState).toBe('WaitingForSignatures');
  });

  test('should return transactions order by update time', async () => {
    const walletId = await testCreateWallet(server);
    const transactionResponse = await newTransactionProposal(server, walletId);

    expect(transactionResponse.statusCode).toBe(StatusCodes.OK);
    expect(transactionResponse.json()).toHaveProperty('transactionId');
    expect(transactionResponse.json()).toHaveProperty('transactionState');
  });

  test('should return transactions in pending state', async () => {
    const walletId = await testCreateWallet(server);

    const transactionResponse = await newTransactionProposal(server, walletId);

    expect(transactionResponse.statusCode).toBe(StatusCodes.OK);
    expect(transactionResponse.json()).toHaveProperty('transactionId');
    expect(transactionResponse.json()).toHaveProperty('transactionState');

    const getTransactionsResponse = await getTransactionProposals(server, walletId, undefined, true);
    expect(getTransactionsResponse.statusCode).toBe(StatusCodes.OK);
    expect(getTransactionsResponse.json()).toHaveLength(1);
  });

  test('should return empty transactions in pending state', async () => {
    const response = await createWallet(server, {
      walletName: '1-of-3 wallet',
      m: 1,
      n: 3,
      cosigner: defaultCosigner
    });
    expect(response.statusCode).toEqual(StatusCodes.OK);
    expect(response.json()).toHaveProperty('walletId');
    const walletId = response.json().walletId;

    const transactionResponse = await newTransactionProposal(server, walletId);

    expect(transactionResponse.statusCode).toBe(StatusCodes.OK);
    expect(transactionResponse.json()).toHaveProperty('transactionId');
    expect(transactionResponse.json()).toHaveProperty('transactionState');
    expect(transactionResponse.json().transactionState).toBe('Signed');

    const getTransactionsResponse = await getTransactionProposals(server, walletId, undefined, true);
    expect(getTransactionsResponse.statusCode).toBe(StatusCodes.OK);
    expect(getTransactionsResponse.json()).toHaveLength(0);
  });
});
