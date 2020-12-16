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

  public hasExpired(): boolean {
    // TODO implement
    return false;
  }

  public async getState(): Promise<WalletState> {
    const countCosigners: number = (await this.getCosigners()).length;
    if (countCosigners >= this.n) {
      return 'Ready';
    }
    if (this.hasExpired()) {
      return 'Expired';
    }
    return 'WaitingForCosigners';
  }

  public async countPendingTransactions(): Promise<number> {
    const transactions: Transaction[] = await this.getTransactions({ include: ['signatures'] });
    const pendingTransactions = transactions.filter(async transaction => transaction.signatures.length >= this.m);
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
      createdAt: this.createdAt.toDateString(),
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
      foreignKey: 'walletId'
    });

    this.belongsToMany(Cosigner, { as: 'cosigners', through: 'walletCosigners' });

    this.belongsTo(Cosigner, {
      as: 'initiator'
    });
  }
}

export default Wallet;
