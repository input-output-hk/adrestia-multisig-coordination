/* eslint-disable no-magic-numbers */
import { FastifyInstance } from 'fastify';
import StatusCodes from 'http-status-codes';
import { Pool } from 'pg';
import { setupDatabase, setupServer } from '../utils/test-utils';
import { newTransactionProposal, testCreateWallet } from './wallet-test-utils';

describe('/wallets/${walletId}/proposal endpoint', () => {
  let database: Pool;
  let server: FastifyInstance;
  beforeAll(() => {
    database = setupDatabase(false);
    server = setupServer(database);
  });

  afterAll(async () => {
    await database.end();
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
