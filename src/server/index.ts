/* eslint-disable no-console */
import { Sequelize } from 'sequelize/types';
import createPool from './db/connection';
import * as Repositories from './db/repositories';
import { initialize } from './model/init';
import buildServer from './server';
import { configure, Services } from './services/services';
import { Environment, parseEnvironment } from './utils/environment-parser';

const start = async (environment: Environment, databasePool: Sequelize) => {
  let server;
  try {
    server = buildServer((httpServer): Services => {
      const repositories = Repositories.configure(environment, databasePool);
      return configure(httpServer, repositories);
    }, environment.LOGGER_LEVEL).addHook('onClose', async () => await databasePool.close());
    await server.listen(environment.PORT, environment.BIND_ADDRESS);

    server.blipp();
  } catch (error) {
    server?.log.error(error);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }
};

const connectDB = async (environment: Environment): Promise<Sequelize> => {
  const databasePool = createPool(environment.DB_CONNECTION_STRING);
  await initialize(databasePool);
  return databasePool;
};

const main = () => {
  const environment = parseEnvironment();
  connectDB(environment)
    .then(databasePool => start(environment, databasePool))
    .catch(error => console.error(error));
};

process.on('uncaughtException', error => {
  console.error(error);
});
process.on('unhandledRejection', error => {
  console.error(error);
});

main();
