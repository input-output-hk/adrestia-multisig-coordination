import { Services } from '../services/services';
import sampleController, { SampleController } from './sample-controller';

// For the sake of the example to show how to inherit from several controllers
interface AnotherController {
  returnSomething(): string;
}

export interface Controllers extends SampleController, AnotherController {}

/**
 * Configures all the controllers required by the app
 *
 * @param services App services
 */
export const configure = (services: Services): Controllers => ({
  ...sampleController(services.blockService),
  // To make it compile
  returnSomething() {
    return 'something';
  }
});
