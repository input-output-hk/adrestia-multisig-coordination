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
  const environment = parseEnvironment();
  const databaseInstance = new Sequelize(environment.DB_CONNECTION_STRING, {
    logging: false
  });
  await initialize(databaseInstance, environment.ENABLE_SYNC);
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

export const addQueryToUrl = (url: string, queryParameters: Record<string, unknown>): string => {
  // Clean undefined and null params
  Object.keys(queryParameters).forEach(key => {
    const value = queryParameters[key];
    if (value === undefined || value === null) {
      delete queryParameters[key];
    }
  });

  // Join non-empty params
  const queryJoined = Object.keys(queryParameters)
    .map(key => `${key}=${queryParameters[key] || ''}`)
    .join('&');

  return queryJoined ? `${url}?${queryJoined}` : url;
};

export const setCreatedAt = async (
  database: Sequelize,
  channelId: Components.Schemas.ChannelId,
  message: Components.Schemas.Message,
  newDate: Date
): Promise<void> => {
  await database.query(
    `
    UPDATE "messages"
    SET "createdAt" = :date
    WHERE "channelId" = :channelId AND "message" = :message`,
    {
      replacements: {
        date: newDate,
        channelId,
        message
      },
      raw: true
    }
  );
};
