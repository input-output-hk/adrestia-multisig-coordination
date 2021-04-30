import { Sequelize } from 'sequelize';
import { Environment } from '../utils/environment-parser';

// export interface Repositories {}

/**
 * Configures the repositories with the given DB connection to make them ready
 * to be used
 *
 * @param database connection to be used to run queries
 */
export const configure = (environment: Environment, database: Sequelize): unknown => null;
