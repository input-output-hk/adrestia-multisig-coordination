import * as http from 'http';
import { Repositories } from '../db/repositories';
import notificationService, { NotificationService } from './notification-service';
import walletService, { WalletService } from './wallet-service';

export interface Services {
  walletService: WalletService;
  notificationService: NotificationService;
}

/**
 * Configures all the services required by the app
 *
 * @param repositories repositories to be used by the services
 */
export const configure = (httpServer: http.Server, repositories: Repositories): Services => {
  const notificationServiceInstance = notificationService(httpServer);
  return {
    notificationService: notificationServiceInstance,
    walletService: walletService(notificationServiceInstance, repositories.walletRepository)
  };
};
