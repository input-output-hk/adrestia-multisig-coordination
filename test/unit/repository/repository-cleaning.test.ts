/* eslint-disable no-magic-numbers */
/* eslint-disable unicorn/consistent-function-scoping */
import http from 'http';
import moment from 'moment';
import { Sequelize } from 'sequelize/types';
import databaseCleaner_, { DBCleaner } from '../../../src/server/db/cleaner';
import Message from '../../../src/server/model/message';
import { parseEnvironment } from '../../../src/server/utils/environment-parser';
import { setCreatedAt, setupDatabase, setupServices } from '../../e2e/utils/test-utils';

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
    setupServices()(new http.Server());
    databaseCleaner = databaseCleaner_(environment);
  });

  afterAll(async () => {
    await database.close();
  });

  beforeEach(async () => {
    if (enableSync) await database.sync({ force: true });
  });

  test('Messages are pruned from DB after TTL', async () => {
    const channelId = 'A';
    const message = 'AA';

    await Message.create({
      channelId,
      message
    });

    const simulatedDate = moment()
      .subtract(pruningTime + 1, 'minutes')
      .toDate();

    await setCreatedAt(database, channelId, message, simulatedDate);

    const prunedMessages = await databaseCleaner.pruneMessages();
    expect(prunedMessages).toBe(1);
    const foundMessage = await Message.findOne({
      where: {
        channelId,
        message
      }
    });
    expect(foundMessage).toBeNull();
  });
});
