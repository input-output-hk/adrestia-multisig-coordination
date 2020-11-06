import { Logger } from 'fastify';
import { SampleRepository } from '../db/sample-repository';

export interface SampleService {
  /**
   * Just a dummy service
   *
   * @param logger
   * @param param
   */
  hello(logger: Logger, param: string): Promise<string | null>;

  /**
   * Just an example of a function that can be unit tested
   */
  justAConstantFn(value: number): number;
}

const configure = (repository: SampleRepository): SampleService => ({
  async hello(logger, parameter) {
    // Do validations, etc
    return repository.findSomething(logger, parameter);
  },

  justAConstantFn(value: number) {
    return value;
  }
});

export default configure;
