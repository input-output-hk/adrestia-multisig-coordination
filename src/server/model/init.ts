import { Sequelize } from 'sequelize';

export const initialize = async (sequelize: Sequelize, enableSync: boolean): Promise<void> => {
  // const models = [];
  // models.forEach(model => model.initialize(sequelize));
  // models.forEach(model => model.defineRelations());
  if (enableSync) await sequelize.sync({ force: true });
};
