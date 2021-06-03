/* eslint-disable no-console */
import { Sequelize } from 'sequelize/types';
import connectDB from './db/connection';
import * as Repositories from './db/repositories';
import buildServer from './server';
import { configure, Services } from './services/services';
import { Environment, parseEnvironment } from './utils/environment-parser';

const start = async (environment: Environment, databasePool: Sequelize) => {
  let server;
  try {
    server = buildServer((httpServer): Services => {
      const repositories = Repositories.configure(environment);
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
