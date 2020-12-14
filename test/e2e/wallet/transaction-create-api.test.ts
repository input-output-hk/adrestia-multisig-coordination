/* eslint-disable no-magic-numbers */
import { FastifyInstance } from 'fastify';
import StatusCodes from 'http-status-codes';
import { Sequelize } from 'sequelize';
import { setupDatabase, setupServer } from '../utils/test-utils';
import { newTransactionProposal, testCreateWallet } from './wallet-test-utils';

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

  test('should return transaction', async () => {
    const walletId = await testCreateWallet(server);
    const transactionResponse = await newTransactionProposal(server, walletId);

    expect(transactionResponse.statusCode).toBe(StatusCodes.OK);
    expect(transactionResponse.json()).toHaveProperty('transactionId');
    expect(transactionResponse.json()).toHaveProperty('transactionState');
  });

  test('should return error if issuer is outsider', async () => {
    const walletId = await testCreateWallet(server);
    const transactionResponse = await newTransactionProposal(server, walletId, {
      tx: 'someTransaction',
      issuer: 'unknown'
    });

    expect(transactionResponse.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });

  test('should return error if wallet isnt valid', async () => {
    await testCreateWallet(server);
    const transactionResponse = await newTransactionProposal(server, 'someInvalidId');

    expect(transactionResponse.statusCode).toBe(StatusCodes.NOT_FOUND);
  });
});
