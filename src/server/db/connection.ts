import { Sequelize } from 'sequelize';
import { initialize } from '../model/init';
import { Environment } from '../utils/environment-parser';

/**
 * Creates a database pool to be used to run queries. No connection will be established.
 *
 * @param connectionString `postgresql://dbuser:secretpassword@database.server.com:3211/mydb`
 */
const createPool = (connectionString: string): Sequelize => new Sequelize(connectionString);

const connectDB = async (environment: Environment): Promise<Sequelize> => {
  const databasePool = createPool(environment.DB_CONNECTION_STRING);
  await initialize(databasePool);
  return databasePool;
};

export default connectDB;
