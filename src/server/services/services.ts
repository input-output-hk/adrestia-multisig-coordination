import { Repositories } from '../db/repositories';
import blockService, { SampleService } from './sample-service';

export interface Services {
  blockService: SampleService;
}

/**
 * Configures all the services required by the app
 *
 * @param repositories repositories to be used by the services
 */
export const configure = (repositories: Repositories): Services => {
  const blockServiceInstance = blockService(repositories.sampleRepository);
  return {
    blockService: blockServiceInstance
  };
};
