import {
  Association,
  HasManyAddAssociationMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  Sequelize,
  Model,
  Optional,
  DataTypes
} from 'sequelize';
import { WalletId } from '../models';

import Wallet from './wallet';

interface CosignerAttributes {
  pubKey: string;
  alias: string;
}

type CosignerAttributesCreation = Optional<CosignerAttributes, 'pubKey'>;

class Cosigner extends Model<CosignerAttributes, CosignerAttributesCreation> implements CosignerAttributes {
  public pubKey!: string;
  public alias!: string;

  public readonly createdAt!: Date;

  public readonly wallets!: Wallet[];

  public getWallets!: HasManyGetAssociationsMixin<Wallet>;
  public addWallet!: HasManyAddAssociationMixin<Wallet, WalletId>;
  public hasWallet!: HasManyHasAssociationMixin<Wallet, WalletId>;
  public countWallet!: HasManyCountAssociationsMixin;
  public createWallet!: HasManyCreateAssociationMixin<Wallet>;

  public static associations: {
    wallets: Association<Cosigner, Wallet>;
  };

  public static initialize(sequelize: Sequelize): void {
    this.init(
      {
        pubKey: {
          type: DataTypes.STRING,
          primaryKey: true
        },
        alias: {
          type: DataTypes.STRING,
          allowNull: false
        }
      },
      {
        sequelize,
        tableName: 'cosigners',
        timestamps: true
      }
    );
  }

  public static defineRelations(): void {
    this.hasMany(Wallet, {
      as: 'wallets'
    });
  }
}
export default Cosigner;
