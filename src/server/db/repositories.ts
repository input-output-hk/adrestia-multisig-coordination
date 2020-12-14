import { Sequelize } from 'sequelize';
import * as WalletRepository from './wallet-repository';

export interface Repositories {
  walletRepository: WalletRepository.WalletRepository;
}

/**
 * Configures the repositories with the given DB connection to make them ready
 * to be used
 *
 * @param database connection to be used to run queries
 */
export const configure = (database: Sequelize): Repositories => ({
  walletRepository: WalletRepository.configure(database)
});
