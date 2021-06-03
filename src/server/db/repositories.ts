import * as MessageRepository from './message-repository';

export interface Repositories {
  messageRepository: MessageRepository.MessageRepository;
}

/**
 * Configures the repositories with the given DB connection to make them ready
 * to be used
 *
 * @returns {*} message repository
 */
export const configure = (): Repositories => ({
  messageRepository: MessageRepository.configure()
});
