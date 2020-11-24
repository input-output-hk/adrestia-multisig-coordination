import { Services } from '../services/services';
import walletController, { WalletController } from './wallet-controller';

// export interface Controllers extends WalletController {}

/**
 * Configures all the controllers required by the app
 *
 * @param services App services
 */
export const configure = (services: Services): WalletController => ({
  ...walletController(services.walletService)
});
