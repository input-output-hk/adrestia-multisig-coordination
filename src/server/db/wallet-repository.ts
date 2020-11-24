import { Logger } from 'fastify';
import { Pool } from 'pg';
import { Wallet, PubKey, CoSigner, WalletId, WalletState } from '../models';
import WalletQueries from './queries/wallet-queries';
import uuid from 'uuid';

export interface WalletRepository {
  createWallet(walletName: string, m: number, n: number, cosigner: CoSigner): Promise<WalletId>;
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
    }
  }));
