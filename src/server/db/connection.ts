import { Sequelize } from 'sequelize';

/**
 * Creates a database pool to be used to run queries. No connection will be established.
 *
 * @param connectionString `postgresql://dbuser:secretpassword@database.server.com:3211/mydb`
 */
const createPool = (connectionString: string): Sequelize => new Sequelize(connectionString);

export default createPool;
