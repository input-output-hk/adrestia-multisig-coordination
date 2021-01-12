import { Sequelize } from 'sequelize';
import Cosigner from './cosigner';
import Signature from './signature';
import Transaction from './transaction';
import Wallet from './wallet';

export const initialize = async (sequelize: Sequelize, enableSync: boolean): Promise<void> => {
  const models = [Cosigner, Wallet, Transaction, Signature];
  models.forEach(model => model.initialize(sequelize));
  models.forEach(model => model.defineRelations());
  if (enableSync) await sequelize.sync({ force: true });
};
