import sequelize, { Op } from 'sequelize';
import Transaction from '../model/transaction';
import Wallet from '../model/wallet';
import { Environment } from '../utils/environment-parser';

interface PruneParams {
  expirationTime: number;
  pruningTime: number;
}

const countCosigners = `(
    SELECT COUNT(*)
    FROM "walletCosigners"
    WHERE
      "walletCosigners"."WalletId" = wallets.id
    )`;

const requiredSignatures = `(
    SELECT m as "requiredSignatures"
    FROM wallets as wallet
    WHERE
      wallet.id = transactions."walletId"
    )`;

const countSignatures = `(
    SELECT COUNT(*)
    FROM signatures AS signature
    WHERE
      signature."transactionId" = transactions.id
    )`;

export class DBCleaner {
  private pruneParams: PruneParams;

  constructor(environment: Environment) {
    this.pruneParams = {
      expirationTime: environment.EXPIRATION_TIME,
      pruningTime: environment.PRUNING_TIME
    };
  }
  /**
   * All the transactions in Expired state or Signed state and `updatedAt + pruningTime < currentDate`
   * will be removed from the system database.
   * @return Promise<number> The number of removed transactions
   */
  public async pruneTransactions(): Promise<number> {
    const pruningTime = this.pruneParams.pruningTime;
    const expirationTime = this.pruneParams.expirationTime;
    const signedTransactionsPruned = await Transaction.destroy({
      where: {
        [Op.and]: [
          sequelize.literal(`${countSignatures} = ${requiredSignatures}`), // Signed
          sequelize.where(
            sequelize.literal(`"updatedAt" + interval '${pruningTime} minute'`),
            sequelize.Op.lt,
            sequelize.fn('NOW')
          )
        ]
      }
    });
    const expiredTransactionsPruned = await Transaction.destroy({
      where: {
        [Op.and]: [
          sequelize.literal(`${countSignatures} < ${requiredSignatures}`), // Not Signed
          sequelize.where(
            sequelize.literal(`"updatedAt" + interval '${expirationTime} minute'`),
            sequelize.Op.lt,
            sequelize.fn('NOW')
          ) // Expired
        ]
      }
    });

    return signedTransactionsPruned + expiredTransactionsPruned;
  }

  /**
   * All the wallets in state Expired and `createdAt + expirationTime + pruningTime < currentDate`
   * will be removed from system db.
   * @return Promise<number> The number of removed wallets
   */
  public async pruneWallets(): Promise<number> {
    const expirationTime = this.pruneParams.expirationTime;
    const pruningTime = this.pruneParams.pruningTime;
    return await Wallet.destroy({
      where: {
        [Op.and]: [
          sequelize.literal(`n > ${countCosigners}`), // WaitingForCosigners
          sequelize.where(
            sequelize.literal(`"createdAt" + interval '${expirationTime + pruningTime} minute'`),
            sequelize.Op.lt,
            sequelize.fn('NOW')
          )
        ]
      }
    });
  }
}

export default (environment: Environment): DBCleaner => new DBCleaner(environment);
