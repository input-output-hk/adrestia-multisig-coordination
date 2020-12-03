import { Pool, QueryResultRow } from 'pg';
import { Wallet, CoSigner, WalletId, Transaction } from '../models';
import WalletQueries from './queries/wallet-queries';
import uuid from 'uuid';
import { mapToWallet } from '../utils/data-mapper';

export interface WalletRepository {
  createWallet(walletName: string, m: number, n: number, cosigner: CoSigner): Promise<WalletId>;
  joinWallet(walletId: string, cosigner: CoSigner): Promise<boolean>;
  findWallet(walletId: string): Promise<{ valid: boolean; wallet?: Wallet }>;
  findCosigners(walletId: string): Promise<CoSigner[]>;
  countPendingTransactions(walletId: string): Promise<{ valid: boolean; pendingTxs?: number }>;
  createTransaction(
    walletId: string,
    transactionProposal: Components.RequestBodies.TransactionProposal
  ): Promise<{ valid: boolean; transaction?: Transaction }>;
  isCosigner(walletId: string, pubKey: string): Promise<boolean>;
}

const getCosigners = async (databaseInstance: Pool, walletId: string) => {
  const result = await databaseInstance.query(WalletQueries.findCosigners(), [walletId]);
  const cosigners: CoSigner[] = [];
  if (result.rowCount > 0) {
    result.rows.forEach(value => {
      const { pubkey, cosigneralias } = value;
      cosigners.push({ pubKey: pubkey, cosignerAlias: cosigneralias });
    });
  }
  return cosigners;
};

export const configure = (databaseInstance: Pool): WalletRepository => ({
  async createWallet(walletName: string, m: number, n: number, cosigner: CoSigner) {
    const walletId: WalletId = uuid.v4();

    await databaseInstance.query(WalletQueries.insertCosigner(), [cosigner.pubKey, cosigner.cosignerAlias, new Date()]);

    await databaseInstance.query(WalletQueries.insertWallet(), [
      walletId,
      walletName,
      m,
      n,
      new Date(),
      cosigner.pubKey
    ]);

    await databaseInstance.query(WalletQueries.insertCosignerInWallet(), [walletId, cosigner.pubKey]);

    return walletId;
  },
  joinWallet: async (walletId, cosigner) => {
    const isValidWallet: boolean = (await databaseInstance.query(WalletQueries.findWallet(), [walletId])).rowCount >= 1;
    if (isValidWallet) {
      await databaseInstance.query(WalletQueries.insertCosigner(), [
        cosigner.pubKey,
        cosigner.cosignerAlias,
        new Date()
      ]);
      await databaseInstance.query(WalletQueries.insertCosignerInWallet(), [walletId, cosigner.pubKey]);
    }
    return isValidWallet;
  },
  findWallet: async walletId => {
    const result: QueryResultRow = await databaseInstance.query(WalletQueries.findWallet(), [walletId]);
    if (result.rowCount === 1) {
      return { valid: true, wallet: mapToWallet(result.rows[0]) };
    }
    return { valid: false };
  },
  findCosigners: async walletId => await getCosigners(databaseInstance, walletId),
  countPendingTransactions: async walletId => ({ valid: false }), // @todo implement
  createTransaction: async (walletId, transactionProposal) => {
    const result: QueryResultRow = await databaseInstance.query(WalletQueries.findWallet(), [walletId]);
    const isValidWallet = result.rowCount === 1;
    if (isValidWallet) {
      const transactionId = uuid.v4();
      const now = new Date();
      await databaseInstance.query(WalletQueries.insertTransaction(), [
        transactionId,
        walletId,
        now,
        now,
        transactionProposal.tx,
        transactionProposal.issuer
      ]);

      const transaction: Transaction = {
        txId: transactionId,
        transactionState: 'WaitingForSignatures',
        createdAt: now.toString(),
        updatedAt: now.toString(),
        unsignedTransaction: transactionProposal.tx,
        issuer: transactionProposal.issuer
      };

      await databaseInstance.query(WalletQueries.insertSignature(), [
        uuid.v4(),
        transactionId,
        transactionProposal.issuer,
        now
      ]);
      return { valid: true, transaction };
    }
    return { valid: false };
  },
  isCosigner: async (walletId: string, issuer: string) => {
    const cosigners: CoSigner[] = await getCosigners(databaseInstance, walletId);
    return cosigners.find(cosigner => cosigner.pubKey === issuer) !== undefined;
  }
});
