import { Pool } from 'pg';
import * as SampleRespository from './sample-repository';

export interface Repositories {
  sampleRepository: SampleRespository.SampleRepository;
}

/**
 * Configures the repositories with the given DB connection to make them ready
 * to be used
 *
 * @param database connection to be used to run queries
 */
export const configure = (database: Pool): Repositories => ({
  sampleRepository: SampleRespository.configure(database)
});
