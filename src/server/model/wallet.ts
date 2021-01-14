import {
  Association,
  BelongsToGetAssociationMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyCountAssociationsMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyHasAssociationMixin,
  BelongsToSetAssociationMixin,
  DataTypes,
  HasManyAddAssociationMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  Model,
  Sequelize
} from 'sequelize';
import { PubKey, TransactionId, WalletState } from '../models';
import Cosigner from './cosigner';
import Transaction from './transaction';

interface WalletAttributes {
  id: string;
  name: string;
  m: number;
  n: number;
}

type WalletAttributesCreation = WalletAttributes;

const expirationTime = process.env.EXPIRATION_TIME;

class Wallet extends Model<WalletAttributes, WalletAttributesCreation> implements WalletAttributes {
  public id!: string;
  public name!: string;
  public m!: number;
  public n!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly transactions!: Transaction[];
  public readonly cosigners!: Cosigner[];
  public readonly initiator!: Cosigner;

  public getCosigners!: BelongsToManyGetAssociationsMixin<Cosigner>;
  public addCosigner!: BelongsToManyAddAssociationMixin<Cosigner, PubKey>;
  public hasCosigner!: BelongsToManyHasAssociationMixin<Cosigner, PubKey>;
  public countCosigners!: BelongsToManyCountAssociationsMixin;

  public getTransactions!: HasManyGetAssociationsMixin<Transaction>;
  public addTransaction!: HasManyAddAssociationMixin<Transaction, TransactionId>;
  public hasTransaction!: HasManyHasAssociationMixin<Transaction, TransactionId>;
  public createTransaction!: HasManyCreateAssociationMixin<Transaction>;

  public getInitiator!: BelongsToGetAssociationMixin<Cosigner>;
  public setInitiator!: BelongsToSetAssociationMixin<Cosigner, PubKey>;

  public static readonly associations: {
    transactions: Association<Wallet, Transaction>;
    cosigners: Association<Wallet, Cosigner>;
    initiator: Association<Wallet, Cosigner>;
  };

  /* eslint-disable no-magic-numbers */
  private isExpired(): boolean {
    const expirationDate = new Date(this.createdAt);
    // use utc time for adding minutes ('x * 60 * 60 * 1000' to convert minutes to milliseconds)
    expirationDate.setTime(expirationDate.getTime() + expirationTime * 60 * 1000);
    const currentDate = new Date();
    return expirationDate.getTime() <= currentDate.getTime();
  }

  public async getState(): Promise<WalletState> {
    const countCosigners: number = (await this.getCosigners()).length;
    if (countCosigners >= this.n) return 'Ready';
    if (this.isExpired()) return 'Expired';
    return 'WaitingForCosigners';
  }

  public async countPendingTransactions(): Promise<number> {
    const transactions: Transaction[] = await this.getTransactions();
    const states = await Promise.all(transactions.map(async transaction => await transaction.getState()));
    const pendingTransactions = transactions.filter((_transaction, index) => states[index] === 'WaitingForSignatures');
    return pendingTransactions.length;
  }

  public async toDTO(): Promise<Components.Responses.WalletState> {
    const cosigners = this.cosigners.map(cosigner => ({
      pubKey: cosigner.pubKey,
      cosignerAlias: cosigner.alias
    }));
    const walletState: WalletState = await this.getState();
    const pendingTxs = await this.countPendingTransactions();
    const initiator = await this.getInitiator();
    return {
      id: this.id,
      name: this.name,
      m: this.m,
      n: this.n,
      initiator: initiator.pubKey,
      createdAt: this.createdAt.toISOString(),
      pendingTxs,
      state: walletState,
      cosigners
    };
  }

  public static initialize(sequelize: Sequelize): void {
    this.init(
      {
        id: {
          type: DataTypes.STRING,
          primaryKey: true
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        m: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        n: {
          type: DataTypes.INTEGER,
          allowNull: false
        }
      },
      {
        sequelize,
        tableName: 'wallets',
        timestamps: true
      }
    );
  }

  public static defineRelations(): void {
    this.hasMany(Transaction, {
      as: 'transactions',
      foreignKey: 'walletId',
      onDelete: 'CASCADE'
    });

    this.belongsToMany(Cosigner, { as: 'cosigners', through: 'walletCosigners', onDelete: 'CASCADE' });

    this.belongsTo(Cosigner, {
      as: 'initiator'
    });
  }
}

export default Wallet;
