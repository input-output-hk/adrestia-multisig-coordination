/* eslint-disable no-magic-numbers */
import { FastifyInstance } from 'fastify';
import { Sequelize } from 'sequelize';
import moment from 'moment';
import { parseEnvironment } from '../../../src/server/utils/environment-parser';
import { setupDatabase, setupServer } from '../utils/test-utils';
import { sendMessageToChannel, getMessagesFromChannel } from '../utils/message-utils';
import { MessageAttributes } from '../../../src/server/model/message';
import { MAX_CHANNEL_LENGTH, STATUS_CODES } from '../../../src/server/utils/constants';

type MessageStored = Components.Schemas.MessageStored;

const defaultMessage: MessageAttributes = {
  channelId: 'new_channel',
  message: '00'
};

describe('GET /message/{channelId} [get messages from channel]', () => {
  let database: Sequelize;
  let server: FastifyInstance;
  let enableSync: boolean;

  beforeAll(async () => {
    database = await setupDatabase(false);
    server = setupServer();
    const environment = parseEnvironment();
    enableSync = environment.ENABLE_SYNC;
    await sendMessageToChannel(server, defaultMessage);
  });

  afterAll(async () => {
    await database.close();
  });

  beforeEach(async () => {
    if (enableSync) await database.sync({ force: true });
  });

  it('should return bad request after requesting for a channel bigger than allowed', async () => {
    const channelId = 'C'.repeat(MAX_CHANNEL_LENGTH + 1);
    const request = await getMessagesFromChannel(server, { channelId });
    expect(request.json()).toHaveProperty('statusCode', STATUS_CODES.BAD_REQUEST);
  });

  it('should return bad request after use bad-formatted date-time filter', async () => {
    const { channelId } = defaultMessage;
    await sendMessageToChannel(server, { channelId, message: 'AA' });
    await sendMessageToChannel(server, { channelId, message: 'BB' });

    const from = 'a bad date';

    const request = await getMessagesFromChannel(server, { channelId, from });

    expect(request.json()).toHaveProperty('statusCode', STATUS_CODES.BAD_REQUEST);
    expect(request.json()).not.toBe('array');
  });

  it('should return stored messages from channel', async () => {
    const { channelId } = defaultMessage;
    await sendMessageToChannel(server, { channelId, message: 'AA' });
    await sendMessageToChannel(server, { channelId, message: 'BB' });
    await sendMessageToChannel(server, { channelId, message: 'CC' });

    const request = await getMessagesFromChannel(server, { channelId });
    expect(request.json()).toHaveLength(3);
    expect(request.json()).not.toHaveProperty('error');
  });

  it('should return only channel messages', async () => {
    const channelA = 'channel_a';
    const channelB = 'channel_b';
    await sendMessageToChannel(server, { channelId: channelA, message: 'AA' });
    await sendMessageToChannel(server, { channelId: channelA, message: 'BB' });
    await sendMessageToChannel(server, { channelId: channelB, message: 'CC' });

    const request = await getMessagesFromChannel(server, { channelId: channelA });
    const result = request.json();

    const haveOnlyChannelA = result.every((item: MessageStored) => item.channelId === channelA);

    expect(result).toHaveLength(2);
    expect(haveOnlyChannelA).toBeTruthy();
  });

  it('should return messages created from the filtered date', async () => {
    const channelId = 'channel_a';

    await sendMessageToChannel(server, { channelId, message: 'AA' });
    const from = moment().toISOString();
    await sendMessageToChannel(server, { channelId, message: 'BB' });
    await sendMessageToChannel(server, { channelId, message: 'CC' });

    const request = await getMessagesFromChannel(server, { channelId, from });
    const result = request.json();

    const everyMessageCreatedAfter = result.every((item: MessageStored) => item.createdAt > from);

    expect(result).toHaveLength(2);
    expect(everyMessageCreatedAfter).toBeTruthy();
  });
});
