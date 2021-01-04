import {
  Association,
  BelongsToManyAddAssociationMixin,
  BelongsToManyCountAssociationsMixin,
  BelongsToManyCreateAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyHasAssociationMixin,
  DataTypes,
  Model,
  Optional,
  Sequelize
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

  public getWallets!: BelongsToManyGetAssociationsMixin<Wallet>;
  public addWallet!: BelongsToManyAddAssociationMixin<Wallet, WalletId>;
  public hasWallet!: BelongsToManyHasAssociationMixin<Wallet, WalletId>;
  public countWallet!: BelongsToManyCountAssociationsMixin;
  public createWallet!: BelongsToManyCreateAssociationMixin<Wallet>;

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
    this.belongsToMany(Wallet, {
      through: 'walletCosigners'
    });
  }
}
export default Cosigner;
