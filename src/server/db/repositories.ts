import { Sequelize } from 'sequelize';
import { Environment } from '../utils/environment-parser';
import * as MessageRepository from './message-repository';

export interface Repositories {
  messageRepository: MessageRepository.MessageRepository;
}

/**
 * Configures the repositories with the given DB connection to make them ready
 * to be used
 *
 * @param database connection to be used to run queries
 */
export const configure = (environment: Environment, database: Sequelize): Repositories => ({
  messageRepository: MessageRepository.configure(environment)
});
