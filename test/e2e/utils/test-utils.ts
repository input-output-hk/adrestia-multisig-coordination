import { FastifyInstance } from 'fastify';
import * as Repositories from '../../../src/server/db/repositories';
import * as Services from '../../../src/server/services/services';
import buildServer from '../../../src/server/server';
import { Sequelize } from 'sequelize';
import { initialize } from '../../../src/server/model/init';

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
  const repositories = Repositories.configure(database);
  const services = Services.configure(repositories);
  return buildServer(services, process.env.LOGGER_LEVEL);
};
