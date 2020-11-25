import { Pool, QueryResultRow } from 'pg';
import { Wallet, CoSigner, WalletId } from '../models';
import WalletQueries from './queries/wallet-queries';
import uuid from 'uuid';
import { mapToWallet } from '../utils/data-mapper';

export interface WalletRepository {
  createWallet(walletName: string, m: number, n: number, cosigner: CoSigner): Promise<WalletId>;
  findWallet(walletId: string): Promise<Wallet | undefined>;
  findCosigners(walletId: string): Promise<CoSigner[]>;
  countPendingTransactions(walletId: string): Promise<number | undefined>;
}

const prepareDB = (
  databaseInstance: Pool,
  configureRepository: (readyDatabaseInstance: Pool) => WalletRepository
): WalletRepository => {
  // insert tables if not exist
  databaseInstance.query(WalletQueries.createCosignersTable());
  databaseInstance.query(WalletQueries.createWalletTable());
  databaseInstance.query(WalletQueries.createWalletCosignersTable());

  return configureRepository(databaseInstance);
};

export const configure = (databaseInstance: Pool): WalletRepository =>
  prepareDB(databaseInstance, readyDatabaseInstance => ({
    async createWallet(walletName: string, m: number, n: number, cosigner: CoSigner) {
      const walletId: WalletId = uuid.v4();
      // register cosigner if not exists
      await readyDatabaseInstance.query(WalletQueries.insertCosigner(), [
        cosigner.pubKey,
        cosigner.cosignerAlias,
        new Date()
      ]);

      // insert new wallet in DB
      await readyDatabaseInstance.query(WalletQueries.insertWallet(), [
        walletId,
        walletName,
        m,
        n,
        new Date(),
        cosigner.pubKey
      ]);

      // insert cosigner in wallet
      await readyDatabaseInstance.query(WalletQueries.insertCosignerInWallet(), [walletId, cosigner.pubKey]);

      return walletId;
    },
    findWallet: async walletId => {
      const result: QueryResultRow = await databaseInstance.query(WalletQueries.findWallet(), [walletId]);
      return result.rowCount === 1 ? mapToWallet(result.rows[0]) : undefined;
    },
    findCosigners: async walletId => {
      const result = await databaseInstance.query(WalletQueries.findCosigners(), [walletId]);
      const cosigners: CoSigner[] = [];
      if (result.rowCount > 0) {
        result.rows.forEach(value => {
          const { pubkey, cosigneralias } = value;
          cosigners.push({ pubKey: pubkey, cosignerAlias: cosigneralias });
        });
      }
      return cosigners;
    },
    countPendingTransactions: async walletId => 0 // @todo implement
  }));
