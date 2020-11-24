import { Repositories } from '../db/repositories';
import walletService, { WalletService } from './wallet-service';

export interface Services {
  walletService: WalletService;
}

/**
 * Configures all the services required by the app
 *
 * @param repositories repositories to be used by the services
 */
export const configure = (repositories: Repositories): Services => {
  const walletServiceInstance = walletService(repositories.walletRepository);
  return {
    walletService: walletServiceInstance
  };
};
