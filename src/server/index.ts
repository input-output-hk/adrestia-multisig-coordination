/* eslint-disable no-console */
import { Pool } from 'pg';
import createPool from './db/connection';
import * as Repostories from './db/repositories';
import buildServer from './server';
import * as Services from './services/services';
import { Environment, parseEnvironment } from './utils/environment-parser';

const start = async (databaseInstance: Pool) => {
  let server;
  try {
    const environment: Environment = parseEnvironment();
    const repository = await Repostories.configure(databaseInstance);
    const services = Services.configure(repository);
    server = buildServer(services, environment.LOGGER_LEVEL);

    server.addHook('onClose', (_, done) => databaseInstance.end(done));
    // eslint-disable-next-line no-magic-numbers
    await server.listen(environment.PORT, environment.BIND_ADDRESS);
    server.blipp();
  } catch (error) {
    server?.log.error(error);
    await databaseInstance?.end();
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }
};

process.on('uncaughtException', error => {
  console.error(error);
});
process.on('unhandledRejection', error => {
  console.error(error);
});

// FIXME this function call should be inside start() function, so process.env.DB_CONNECTION_STRING
// is validated through environment-parser, and for a better error handling too.
const connectDB = async () => await createPool(process.env.DB_CONNECTION_STRING);

connectDB()
  .then(databaseInstance => start(databaseInstance))
  .catch(console.error);
