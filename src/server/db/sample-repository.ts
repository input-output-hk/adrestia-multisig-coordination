import { Logger } from 'fastify';
import { Pool } from 'pg';
import SampleQueries from './queries/sample-queries';

export interface SampleRepository {
  /**
   * Find something example
   *
   * @param logger
   * @param toFind what to look for in the db
   * @returns what was found
   */
  findSomething(logger: Logger, toFind: string): Promise<string | null>;
}

export const configure = (databaseInstance: Pool): SampleRepository => ({
  findSomething(logger, toFind) {
    // query for the db here using the databaseInstance
    // databaseInstance.query(SampleQueries.findSomething(), [toFind]);
    logger.debug(`[findSomething] Looking for ${toFind}`);
    return Promise.resolve('hi!');
  }
});
