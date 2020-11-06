import { FastifyRequest } from 'fastify';
import { SampleService } from '../services/sample-service';
import { mapToSampleResponse } from '../utils/data-mapper';

export interface SampleController {
  sampleMethod(
    request: FastifyRequest<unknown, unknown, unknown, unknown, Components.Schemas.SampleRequest>
  ): Promise<Components.Schemas.SampleResponse | Components.Schemas.SampleResponseError>;
}

const configure = (sampleService: SampleService): SampleController => ({
  async sampleMethod(request) {
    const parameter = request.body.param;
    const logger = request.log;
    logger.info(`[sampleMethod] Request received with param ${parameter}`);
    const sampleResult = await sampleService.hello(logger, parameter);
    return sampleResult ? mapToSampleResponse(sampleResult) : { error: 'Result not found' };
  }
});

export default configure;
