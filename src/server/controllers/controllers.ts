import { Services } from '../services/services';
import messageController, { MessageController } from './message-controller';

/**
 * Configures all the controllers required by the app
 *
 * @param services App services
 */
export const configure = (services: Services): MessageController => ({
  ...messageController(services.messageService)
});
