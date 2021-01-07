/* eslint-disable no-magic-numbers */
/* eslint-disable unicorn/consistent-function-scoping */
import * as http from 'http';
import moment from 'moment';
import { Sequelize } from 'sequelize/types';
import databaseCleaner_, { DBCleaner } from '../../../src/server/db/cleaner';
import Transaction from '../../../src/server/model/transaction';
import Wallet from '../../../src/server/model/wallet';
import { WalletService } from '../../../src/server/services/wallet-service';
import { parseEnvironment } from '../../../src/server/utils/environment-parser';
import { setCreatedAt, setupDatabase, setUpdatedAt, setupServices } from '../../e2e/utils/test-utils';
import { createCosigner, defaultCosigner } from '../../e2e/wallet/wallet-test-utils';

describe('DB cleaning mechanism', () => {
  let database: Sequelize;
  let databaseCleaner: DBCleaner;
  let walletService: WalletService;
  let expirationTime: number; // in minutes
  let pruningTime: number; // in minutes

  beforeAll(async () => {
    const environment = parseEnvironment();
    expirationTime = environment.EXPIRATION_TIME;
    pruningTime = environment.PRUNING_TIME;
    database = await setupDatabase(false);
    walletService = setupServices(environment, database)(new http.Server()).walletService;
    databaseCleaner = databaseCleaner_(environment);
  });
  afterAll(async () => {
    await database.close();
  });

  beforeEach(async () => {
    await database.sync({ force: true });
  });

  const givenAnExpiredTransaction = async (): Promise<string> => {
    const walletId = await walletService.createWallet('someName', 2, 3, defaultCosigner);
    // fill wallet
    await walletService.joinWallet(walletId, createCosigner('someAlias'));
    await walletService.joinWallet(walletId, createCosigner('someAlias2'));

    // create transaction proposal
    const transaction = await walletService.newTransactionProposal(walletId, {
      issuer: defaultCosigner.pubKey,
      tx: 'someTransaction'
    });

    // force updateAt value to an old one
    const simulatedDate = moment()
      .subtract(expirationTime, 'minutes')
      .subtract(expirationTime, 'seconds') // ensure extra time
      .toDate();
    await setUpdatedAt(database, 'transactions', transaction.transactionId, simulatedDate);
    return transaction.transactionId;
  };

  test('transactions in WaitingForSignatures state should expire after expiration time', async () => {
    const transactionId = await givenAnExpiredTransaction();
    // new state should be 'Expired'
    const expiredTransaction = await Transaction.findByPk(transactionId);
    expect(expiredTransaction).not.toBeNull();
    const expiredState = await expiredTransaction?.getState();
    expect(expiredState).toBe('Expired');
  });

  test('wallets in WaitingForCosigners state should expire after expiration time', async () => {
    const walletId = await walletService.createWallet('someName', 2, 3, defaultCosigner);
    const wallet = await walletService.getWallet(walletId);
    expect(wallet.state).toBe('WaitingForCosigners');

    const simulatedDate = moment()
      .subtract(expirationTime, 'minutes')
      .subtract(expirationTime, 'seconds') // ensure extra time
      .toDate();
    await setCreatedAt(database, 'wallets', walletId, simulatedDate);
    const expiredWallet = await Wallet.findByPk(walletId);
    expect(expiredWallet).not.toBeNull();
    const expiredState = await expiredWallet?.getState();
    expect(expiredState).toBe('Expired');
  });

  test('transactions in Signed state should be removed after pruning time', async () => {
    const walletId = await walletService.createWallet('someName', 2, 3, defaultCosigner);
    const secondCosigner = createCosigner('someAlias');
    // fill wallet
    await walletService.joinWallet(walletId, secondCosigner);
    await walletService.joinWallet(walletId, createCosigner('someAlias2'));

    // create transaction proposal
    const transaction = await walletService.newTransactionProposal(walletId, {
      issuer: defaultCosigner.pubKey,
      tx: 'someTransaction'
    });
    expect(transaction.transactionState).toBe('WaitingForSignatures');

    // sign proposal
    await walletService.signTransaction(transaction.transactionId, secondCosigner.pubKey);
    const signedTransaction = await Transaction.findByPk(transaction.transactionId);
    expect(signedTransaction).not.toBeNull();

    const signedTransactionState = await signedTransaction?.getState();
    expect(signedTransactionState).toBe('Signed');

    // force updateAt value to an old one
    const simulatedDate = moment()
      .subtract(expirationTime, 'minutes')
      .subtract(pruningTime, 'minutes')
      .subtract(expirationTime, 'seconds') // ensure with extra time
      .toDate();
    await setUpdatedAt(database, 'transactions', transaction.transactionId, simulatedDate);

    // prune db
    await databaseCleaner.pruneTransactions();
    expect(await Transaction.findByPk(transaction.transactionId)).toBeNull();
  });

  test('wallets in Expired state should be removed after pruning time', async () => {
    const walletId = await walletService.createWallet('someName', 2, 3, defaultCosigner);
    const wallet = await walletService.getWallet(walletId);
    expect(wallet.state).toBe('WaitingForCosigners');

    // force createdAt value to an old one
    const simulatedDate = moment()
      .subtract(expirationTime, 'minutes')
      .subtract(pruningTime, 'minutes')
      .subtract(expirationTime, 'seconds') // ensure with extra time
      .toDate();
    await setCreatedAt(database, 'wallets', walletId, simulatedDate);

    // prune db
    await databaseCleaner.pruneWallets();
    const removedWallet = await Wallet.findByPk(walletId);
    expect(removedWallet).toBeNull();
  });

  test('transactions in Expired state should be removed after pruning time', async () => {
    const expiredTransactionId = await givenAnExpiredTransaction();

    // prune db
    await databaseCleaner.pruneTransactions();
    const removedTransaction = await Transaction.findByPk(expiredTransactionId);
    expect(removedTransaction).toBeNull();
  });
});
