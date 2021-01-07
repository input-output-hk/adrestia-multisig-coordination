/* eslint-disable no-console */
import cron from 'node-cron';
import { Environment, parseEnvironment } from '../utils/environment-parser';
import databaseCleaner_, { DBCleaner } from './cleaner';
import connectDB from './connection';

const prune = async (databaseCleaner: DBCleaner): Promise<void> => {
  console.log('DB cleaning mechanism: task started');
  const removedTransactions = await databaseCleaner.pruneTransactions();
  console.log(`Number of removed transactions: ${removedTransactions}`);
  const removedWallets = await databaseCleaner.pruneWallets();
  console.log(`Number of removed wallets: ${removedWallets}`);
  console.log('DB cleaning mechanism: task finished');
};

const schedulePruning = (environment: Environment): void => {
  console.log(`DB cleaning mechanism scheduled with ${environment.CRON_EXPRESSION}`);
  const databaseCleaner = databaseCleaner_(environment);
  cron.schedule(environment.CRON_EXPRESSION, async () => await prune(databaseCleaner)).start();
};

const main = () => {
  const environment = parseEnvironment();
  connectDB(environment)
    .then(() => schedulePruning(environment))
    .catch(error => console.error(error));
};

main();
