/* eslint-disable no-magic-numbers */
/* eslint-disable unicorn/consistent-function-scoping */
import * as http from 'http';
import { Sequelize } from 'sequelize/types';
import databaseCleaner_, { DBCleaner } from '../../../src/server/db/cleaner';
import { parseEnvironment } from '../../../src/server/utils/environment-parser';
import { setupDatabase, setupServices } from '../../e2e/utils/test-utils';

describe('DB cleaning mechanism', () => {
  let database: Sequelize;
  let databaseCleaner: DBCleaner;
  let pruningTime: number; // in minutes
  let enableSync: boolean;

  beforeAll(async () => {
    const environment = parseEnvironment();
    pruningTime = environment.PRUNING_TIME;
    enableSync = environment.ENABLE_SYNC;
    database = await setupDatabase(false);
    setupServices(environment, database)(new http.Server());
    databaseCleaner = databaseCleaner_(environment);
  });

  afterAll(async () => {
    await database.close();
  });

  beforeEach(async () => {
    if (enableSync) await database.sync({ force: true });
  });

  // remove/redefine when the channels implementation are ready
  test('fake test to prevent suite tests from failing', () => {
    expect(true).toBe(true);
  });
});
