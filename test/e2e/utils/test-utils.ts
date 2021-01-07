import { FastifyInstance } from 'fastify';
import { Sequelize } from 'sequelize';
import * as Repositories from '../../../src/server/db/repositories';
import { initialize } from '../../../src/server/model/init';
import buildServer from '../../../src/server/server';
import * as Services from '../../../src/server/services/services';
import { Environment, parseEnvironment } from '../../../src/server/utils/environment-parser';

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

export const setupServices = (
  environment: Environment,
  database: Sequelize
): ((httpServer: import('http').Server) => Services.Services) => httpServer => {
  const repositories = Repositories.configure(environment, database);
  return Services.configure(httpServer, repositories);
};

export const setupServer = (database: Sequelize): FastifyInstance => {
  const environment = parseEnvironment();

  return buildServer(setupServices(environment, database), environment.LOGGER_LEVEL);
};

const setDate = async (
  database: Sequelize,
  table: string,
  id: string,
  newDate: Date,
  column: string
): Promise<void> => {
  await database.query(
    `
    UPDATE ${table}
    SET "${column}" = :date
    WHERE id = :id`,
    {
      replacements: {
        date: newDate,
        id
      }
    }
  );
};

export const setCreatedAt = async (database: Sequelize, table: string, id: string, newDate: Date): Promise<void> => {
  await setDate(database, table, id, newDate, 'createdAt');
};

export const setUpdatedAt = async (database: Sequelize, table: string, id: string, newDate: Date): Promise<void> => {
  await setDate(database, table, id, newDate, 'updatedAt');
};
