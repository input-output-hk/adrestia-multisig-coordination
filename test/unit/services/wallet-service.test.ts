import * as http from 'http';
import moment from 'moment';
import { Sequelize } from 'sequelize/types';
import * as Repositories from '../../../src/server/db/repositories';
import * as Services from '../../../src/server/services/services';
import { WalletService } from '../../../src/server/services/wallet-service';
import { parseEnvironment } from '../../../src/server/utils/environment-parser';
import { setupDatabase } from '../../e2e/utils/test-utils';
import { defaultCosigner } from '../../e2e/wallet/wallet-test-utils';

const setUpdatedAt = async (database: Sequelize, transactionId: string, newDate: Date) => {
  await database.query(
    `
    UPDATE transactions
    SET "updatedAt" = :date
    WHERE id = :id`,
    {
      replacements: {
        date: newDate,
        id: transactionId
      }
    }
  );
};

const requiredSignatures = 2;
const requiredCosigners = 3;
const daysToSubtract = 7;

describe('transactions should be in order by date', () => {
  let database: Sequelize;
  let walletService: WalletService;

  beforeAll(async () => {
    const environment = parseEnvironment();
    database = await setupDatabase(false);
    walletService = Services.configure(new http.Server(), Repositories.configure(environment, database)).walletService;
  });

  afterAll(async () => {
    await database.close();
  });

  beforeEach(async () => {
    await database.sync({ force: true });
  });

  test('return transactions in order by date (ASC)', async () => {
    const walletId = await walletService.createWallet(
      'someName',
      requiredSignatures,
      requiredCosigners,
      defaultCosigner
    );
    const firstTransaction = await walletService.newTransactionProposal(walletId, {
      tx: 'firstTransacation',
      issuer: defaultCosigner.pubKey
    });

    const secondTransaction = await walletService.newTransactionProposal(walletId, {
      tx: 'secondTransacation',
      issuer: defaultCosigner.pubKey
    });

    const sevenDaysAgo = moment()
      .subtract(daysToSubtract, 'd')
      .toDate();
    await setUpdatedAt(database, secondTransaction.transactionId, sevenDaysAgo);

    const expectdAmountTransactions = 2;
    const allTransactions = await walletService.getTransactions(walletId);
    expect(allTransactions).toHaveLength(expectdAmountTransactions);
    expect(allTransactions[0].transactionId).toBe(secondTransaction.transactionId);
    expect(allTransactions[1].transactionId).toBe(firstTransaction.transactionId);
  });

  test('return transactions based on from parameter', async () => {
    const walletId = await walletService.createWallet(
      'someName',
      requiredSignatures,
      requiredCosigners,
      defaultCosigner
    );
    const firstTransaction = await walletService.newTransactionProposal(walletId, {
      tx: 'firstTransaction',
      issuer: defaultCosigner.pubKey
    });

    const secondTransaction = await walletService.newTransactionProposal(walletId, {
      tx: 'secondTransaction',
      issuer: defaultCosigner.pubKey
    });

    const sevenDaysAgo = moment()
      .subtract(daysToSubtract, 'd')
      .toDate();

    await setUpdatedAt(database, secondTransaction.transactionId, sevenDaysAgo);

    const one = 1;
    const oneDayAgo = moment()
      .subtract(one, 'd')
      .toDate();

    const allTransactions = await walletService.getTransactions(walletId, oneDayAgo.toDateString());
    expect(allTransactions).toHaveLength(1);
    expect(allTransactions[0].transactionId).toBe(firstTransaction.transactionId);
  });
});
