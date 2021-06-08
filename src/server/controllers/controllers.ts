import { Services } from '../services/services';
import messageController, { MessageController } from './message-controller';

/**
 * Configures all the controllers required by the app
 *
 * @param {Services} services App services
 * @returns {MessageController} Message controller already configured
 */
export const configure = (services: Services): MessageController => ({
  ...messageController(services.messageService)
});
