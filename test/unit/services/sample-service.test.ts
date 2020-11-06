import { SampleRepository } from '../../../src/server/db/sample-repository';
import configure, { SampleService } from '../../../src/server/services/sample-service';

describe('Sample Service', () => {
  let sampleService: SampleService;

  const mockRepository: SampleRepository = {
    findSomething: jest.fn()
  };

  beforeAll(() => {
    sampleService = configure(mockRepository);
  });

  describe('Address type detection', () => {
    it('Return 2', () => {
      const VALUE = 2;
      expect(sampleService.justAConstantFn(VALUE)).toBe(VALUE);
    });
  });
});
