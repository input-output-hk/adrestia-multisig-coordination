import sequelize, { Op, Sequelize, WhereOptions } from 'sequelize';
import Cosigner from '../model/cosigner';
import Transaction from '../model/transaction';
import Wallet from '../model/wallet';
import { PubKey, TransactionId, WalletId } from '../models';
import { Environment } from '../utils/environment-parser';
import { ErrorFactory } from '../utils/errors';

const countSignatures = `(
  SELECT COUNT(*)
  FROM signatures AS signature
  WHERE
    signature."transactionId" = "Transaction".id
  )`;

const signedBy = (cosigner: string): string => `
  EXISTS(SELECT *
  FROM signatures AS signature
  WHERE
    signature."transactionId" = "Transaction".id
  AND
    signature."cosignerPubKey" = '${cosigner}')`;

export interface WalletRepository {
  findTransactions(walletId: string, from?: string, pending?: boolean, cosigner?: string): Promise<Transaction[]>;
  addCosigner(cosigner: Components.Schemas.CoSigner): Promise<Cosigner>;
  findCosigner(pubKey: PubKey): Promise<Cosigner | null>;
  findWallet(id: WalletId): Promise<Wallet | null>;
  findTransaction(id: TransactionId): Promise<Transaction | null>;
}

export const configure = (environment: Environment, database: Sequelize): WalletRepository => ({
  addCosigner: async cosigner => {
    const [databaseCosigner, created] = await Cosigner.findOrCreate({
      where: {
        pubKey: cosigner.pubKey
      },
      defaults: {
        pubKey: cosigner.pubKey,
        alias: cosigner.cosignerAlias
      }
    });
    if (!created) {
      databaseCosigner.set({ alias: cosigner.cosignerAlias });
    }
    return databaseCosigner;
  },
  findWallet: async id =>
    await Wallet.findByPk(id, {
      include: ['cosigners', 'transactions', 'initiator']
    }),
  findCosigner: async pubKey => await Cosigner.findByPk(pubKey),
  findTransaction: async id =>
    await Transaction.findByPk(id, {
      include: ['wallet']
    }),
  findTransactions: async (walletId, from, pending, cosigner) => {
    const wallet = await Wallet.findByPk(walletId);
    if (!wallet) {
      throw ErrorFactory.walletNotFound;
    }

    if (cosigner && !(await wallet.hasCosigner(cosigner))) {
      throw ErrorFactory.invalidCosigner;
    }

    const requiredSignatures = wallet.m;

    const whereClause: WhereOptions[] = [];
    if (pending) {
      whereClause.push(sequelize.literal(`${requiredSignatures} > ${countSignatures}`));
    }
    if (cosigner) {
      whereClause.push(sequelize.literal(`${pending ? 'NOT' : ''} ${signedBy(cosigner)}`));
    }
    if (from) {
      whereClause.push({
        updatedAt: {
          [Op.gte]: new Date(from)
        }
      });
    }

    return await wallet.getTransactions({
      order: [['updatedAt', 'ASC']],
      where: {
        [Op.and]: whereClause
      },
      limit: environment.PAGE_SIZE
    });
  }
});
