import {
  Association,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  DataTypes,
  HasManyAddAssociationMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  Model,
  Sequelize
} from 'sequelize';
import { PubKey, TransactionId } from '../models';
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

  public readonly transactions!: Transaction[];
  public readonly cosigners!: Cosigner[];
  public readonly initiator!: Cosigner;

  public getCosigners!: HasManyGetAssociationsMixin<Cosigner>;
  public addCosigner!: HasManyAddAssociationMixin<Cosigner, PubKey>;
  public hasCosigner!: HasManyHasAssociationMixin<Cosigner, PubKey>;
  public countCosigners!: HasManyCountAssociationsMixin;

  public getTransactions!: HasManyGetAssociationsMixin<Transaction>;
  public addTransaction!: HasManyAddAssociationMixin<Transaction, TransactionId>;
  public hasTransaction!: HasManyHasAssociationMixin<Transaction, TransactionId>;
  public createTransaction!: HasManyCreateAssociationMixin<Transaction>;

  public getInitiator!: BelongsToGetAssociationMixin<Cosigner>;
  public setInitiator!: BelongsToSetAssociationMixin<Cosigner, PubKey>;

  public static associations: {
    transactions: Association<Wallet, Transaction>;
    cosigners: Association<Wallet, Cosigner>;
    initiator: Association<Wallet, Cosigner>;
  };

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
      as: 'transactions'
    });

    this.belongsToMany(Cosigner, { through: 'walletCosigners' });

    this.belongsTo(Cosigner, {
      as: 'initiator'
    });
  }
}

export default Wallet;
