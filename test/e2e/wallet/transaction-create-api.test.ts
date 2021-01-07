import { FastifyInstance } from 'fastify';
import StatusCodes from 'http-status-codes';
import { Sequelize } from 'sequelize';
import { parseEnvironment } from '../../../src/server/utils/environment-parser';
import { setupDatabase, setupServer } from '../utils/test-utils';
import {
  getWallet,
  newTransactionProposal,
  testCreateExpiredWallet,
  testCreateReadyWallet,
  testCreateWallet
} from './wallet-test-utils';

describe('/wallets/${walletId}/proposal endpoint', () => {
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

  test('should return transaction', async () => {
    const walletId = await testCreateReadyWallet(server);
    const transactionResponse = await newTransactionProposal(server, walletId);

    expect(transactionResponse.statusCode).toBe(StatusCodes.OK);
    expect(transactionResponse.json()).toHaveProperty('transactionId');
    expect(transactionResponse.json()).toHaveProperty('transactionState');
  });

  test('should return error if issuer is outsider', async () => {
    const walletId = await testCreateReadyWallet(server);
    const transactionResponse = await newTransactionProposal(server, walletId, {
      tx: 'someTransaction',
      issuer: 'unknown'
    });

    expect(transactionResponse.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });

  test('should return error if wallet isnt valid', async () => {
    const transactionResponse = await newTransactionProposal(server, 'someInvalidId');

    expect(transactionResponse.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  test('should return error if wallet state is Expired', async () => {
    const walletId = await testCreateExpiredWallet(server, database, expirationTime);

    const transactionResponse = await newTransactionProposal(server, walletId);
    expect(transactionResponse.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });

  test('should return error if wallet state is WaitingForCosigners', async () => {
    const walletId = await testCreateWallet(server);

    const walletResponse = await getWallet(server, walletId);
    expect(walletResponse.statusCode).toEqual(StatusCodes.OK);
    expect(walletResponse.json()).toHaveProperty('state');
    expect(walletResponse.json().state).toBe('WaitingForCosigners');

    const transactionResponse = await newTransactionProposal(server, walletId);
    expect(transactionResponse.statusCode).toBe(StatusCodes.BAD_REQUEST);
  });
});
