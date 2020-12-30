import { FastifyInstance } from 'fastify';
import { Sequelize } from 'sequelize';
import * as Repositories from '../../../src/server/db/repositories';
import { initialize } from '../../../src/server/model/init';
import buildServer from '../../../src/server/server';
import * as Services from '../../../src/server/services/services';
import { parseEnvironment } from '../../../src/server/utils/environment-parser';

export const setupDatabase = async (offline: boolean): Promise<Sequelize> => {
  if (offline) {
    const poolMock = new Sequelize();
    poolMock.query = jest.fn();
    return poolMock;
  }
  const databaseInstance = new Sequelize(process.env.DB_CONNECTION_STRING, {
    logging: false
  });
  await initialize(databaseInstance);
  return databaseInstance;
};

export const setupServer = (database: Sequelize): FastifyInstance => {
  const environment = parseEnvironment();

  return buildServer(httpServer => {
    const repositories = Repositories.configure(environment, database);
    return Services.configure(httpServer, repositories);
  }, environment.LOGGER_LEVEL);
};
