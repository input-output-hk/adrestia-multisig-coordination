import { Sequelize } from 'sequelize';
import Message from './message';

export const initialize = async (sequelize: Sequelize, enableSync: boolean): Promise<void> => {
  const models = [Message];
  models.forEach(model => model.initialize(sequelize));
  if (enableSync) await sequelize.sync({ force: true });
};
