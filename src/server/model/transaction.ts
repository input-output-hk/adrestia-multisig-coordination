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
import { PubKey, TransactionState, WalletId } from '../models';
import Cosigner from './cosigner';
import Signature from './signature';
import Wallet from './wallet';

interface TransactionAttributes {
  id: string;
  unsignedTransaction: string;
}

type TransactionAttributesCreation = TransactionAttributes;

const expirationTime = process.env.EXPIRATION_TIME;

class Transaction extends Model<TransactionAttributes, TransactionAttributesCreation> implements TransactionAttributes {
  public id!: string;
  public unsignedTransaction!: string;

  public readonly wallet!: Wallet;
  public readonly issuer!: Cosigner;
  public readonly signatures!: Signature[];

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getSignatures!: HasManyGetAssociationsMixin<Signature>;
  public countSignatures!: HasManyCountAssociationsMixin;
  public createSignature!: HasManyCreateAssociationMixin<Signature>;
  public addSignature!: HasManyAddAssociationMixin<Signature, PubKey>;
  public hasSignature!: HasManyHasAssociationMixin<Signature, PubKey>;

  public getIssuer!: BelongsToGetAssociationMixin<Cosigner>;
  public setIssuer!: BelongsToSetAssociationMixin<Cosigner, PubKey>;

  public getWallet!: BelongsToGetAssociationMixin<Wallet>;
  public setWallet!: BelongsToSetAssociationMixin<Wallet, WalletId>;

  public static associations: {
    wallet: Association<Transaction, Wallet>;
    issuer: Association<Transaction, Cosigner>;
    signatures: Association<Transaction, Signature>;
  };

  /* eslint-disable no-magic-numbers */
  private isExpired(): boolean {
    const expirationDate = new Date(this.updatedAt);
    // use utc time for adding minutes ('x * 60 * 1000' to convert minutes to milliseconds)
    expirationDate.setTime(this.updatedAt.getTime() + expirationTime * 60 * 1000);
    const currentDate = new Date(Date.now());
    return expirationDate <= currentDate;
  }

  public async getState(): Promise<TransactionState> {
    const countSignatures = await this.countSignatures();
    const requiredSignatures = (await this.getWallet()).m;
    if (countSignatures >= requiredSignatures) return 'Signed';
    if (this.isExpired()) return 'Expired';
    return 'WaitingForSignatures';
  }

  public async toDTO(): Promise<Components.Responses.TransactionProposal> {
    return {
      transactionId: this.id,
      transactionState: await this.getState(),
      createdAt: this.createdAt.toUTCString(),
      updatedAt: this.updatedAt.toUTCString(),
      unsignedTransaction: this.unsignedTransaction
    };
  }

  public static initialize(sequelize: Sequelize): void {
    this.init(
      {
        id: {
          type: DataTypes.STRING,
          primaryKey: true
        },
        unsignedTransaction: {
          type: DataTypes.STRING,
          allowNull: false
        }
      },
      {
        sequelize,
        tableName: 'transactions',
        timestamps: true
      }
    );
  }

  public static defineRelations(): void {
    this.hasMany(Signature, {
      as: 'signatures',
      foreignKey: 'transactionId',
      onDelete: 'CASCADE'
    });

    this.belongsTo(Cosigner, {
      as: 'issuer'
    });

    this.belongsTo(Wallet, {
      as: 'wallet',
      foreignKey: 'walletId'
    });
  }
}

export default Transaction;
