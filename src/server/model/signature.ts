import { BelongsToGetAssociationMixin, BelongsToSetAssociationMixin, DataTypes, Model, Sequelize } from 'sequelize';
import { PubKey, TransactionId, Witness } from '../models';
import Cosigner from './cosigner';
import Transaction from './transaction';

interface SignatureAttributes {
  id: string;
  witness: Witness;
}

type SignatureAttributesCreation = SignatureAttributes;

class Signature extends Model<SignatureAttributes, SignatureAttributesCreation> implements SignatureAttributes {
  public id!: string;
  public witness!: Witness;

  public readonly createdAt!: Date | null;

  public readonly transaction!: Transaction;
  public readonly cosigner!: Cosigner;

  public getTransaction!: BelongsToGetAssociationMixin<Transaction>;
  public setTransaction!: BelongsToSetAssociationMixin<Transaction, TransactionId>;

  public getCosigner!: BelongsToGetAssociationMixin<Cosigner>;
  public setCosigner!: BelongsToSetAssociationMixin<Cosigner, PubKey>;

  public static initialize(sequelize: Sequelize): void {
    this.init(
      {
        id: {
          type: DataTypes.STRING,
          primaryKey: true
        },
        witness: {
          type: DataTypes.STRING,
          allowNull: false
        }
      },
      {
        sequelize,
        tableName: 'signatures',
        timestamps: true
      }
    );
  }

  public static defineRelations(): void {
    this.belongsTo(Cosigner, {
      as: 'cosigner',
      foreignKey: 'cosignerPubKey'
    });

    this.belongsTo(Transaction, {
      as: 'transaction',
      foreignKey: 'transactionId',
      onDelete: 'CASCADE'
    });
  }
}

export default Signature;
