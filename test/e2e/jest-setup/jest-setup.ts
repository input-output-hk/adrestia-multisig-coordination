import dotenv from 'dotenv';
import path from 'path';
import { Pool } from 'pg';
import { parse } from 'pg-connection-string';
import WalletQueries from '../../../src/server/db/queries/wallet-queries';
import { setupDatabase } from '../utils/test-utils';
import { setupPostgresContainer } from './docker';

dotenv.config({ path: path.join(__dirname, '../../../.env.test') });

const prepareDB = async (databaseInstance: Pool) => {
  // insert tables if not exist
  await databaseInstance.query(WalletQueries.createCosignersTable());
  await databaseInstance.query(WalletQueries.createWalletTable());
  await databaseInstance.query(WalletQueries.createWalletCosignersTable());
  await databaseInstance.query(WalletQueries.createTransactionsTable());
  await databaseInstance.query(WalletQueries.createSignaturesTable());
};

module.exports = async () => {
  const { user, database, password, port } = parse(process.env.DB_CONNECTION_STRING);
  await setupPostgresContainer(
    database ? database : 'test',
    user ? user : 'postgres',
    password ? password : 'mysecretpassword',
    port ? port : '5432'
  );
  const databaseInstance = setupDatabase(false);
  await prepareDB(databaseInstance);
  await databaseInstance.end();
};
