import { PubKey, TransactionId, WalletId } from '../models';
import Cosigner from '../model/cosigner';
import Wallet from '../model/wallet';
import Transaction from '../model/transaction';
import { Sequelize } from 'sequelize/types';

export interface WalletRepository {
  addCosigner(cosigner: Components.Schemas.CoSigner): Promise<Cosigner>;
  findCosigner(pubKey: PubKey): Promise<Cosigner | null>;
  findWallet(id: WalletId): Promise<Wallet | null>;
  findTransaction(id: TransactionId): Promise<Transaction | null>;
}

export const configure = (database: Sequelize): WalletRepository => ({
  addCosigner: async cosigner => {
    const existantCosigner = await Cosigner.findByPk(cosigner.pubKey);
    const cosignerAttributes = {
      pubKey: cosigner.pubKey,
      alias: cosigner.cosignerAlias
    };
    if (existantCosigner) {
      const [updatedCosigner] = await Cosigner.upsert(cosignerAttributes);
      return updatedCosigner;
    }
    return await Cosigner.create(cosignerAttributes);
  },
  findWallet: async id => await Wallet.findByPk(id),
  findCosigner: async pubKey => await Cosigner.findByPk(pubKey),
  findTransaction: async id => await Transaction.findByPk(id)
});
