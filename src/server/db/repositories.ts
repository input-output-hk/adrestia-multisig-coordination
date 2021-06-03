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
 * @param {*} environment connection to be used to run queries
 * @returns {*} message repository
 */
export const configure = (environment: Environment): Repositories => ({
  messageRepository: MessageRepository.configure(environment)
});
