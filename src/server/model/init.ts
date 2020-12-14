import { Sequelize } from 'sequelize';
import Cosigner from './cosigner';
import Signature from './signature';
import Transaction from './transaction';
import Wallet from './wallet';

export const initialize = async (sequelize: Sequelize): Promise<void> => {
  const models = [Cosigner, Wallet, Transaction, Signature];
  models.forEach(model => model.initialize(sequelize));
  models.forEach(model => model.defineRelations());
  await sequelize.sync({ force: true }); // TODO If force is true will drop all tables and create them again. We should include other way to fix tables when there are changes.
};
