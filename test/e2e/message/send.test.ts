/* eslint-disable no-magic-numbers */
import { FastifyInstance } from 'fastify';
import { Sequelize } from 'sequelize';
import moment from 'moment';
import { parseEnvironment } from '../../../src/server/utils/environment-parser';
import { setupDatabase, setupServer } from '../utils/test-utils';
import { sendMessageToChannel, getMessagesFromChannel } from '../utils/message-utils';
import { MessageAttributes } from '../../../src/server/model/message';
import { MAX_CHANNEL_LENGTH, MAX_MESSAGE_LENGTH, STATUS_CODES } from '../../../src/server/utils/constants';

type MessageStored = Components.Schemas.MessageStored;

const defaultMessage: MessageAttributes = {
  channelId: 'new_channel',
  message: '00'
};

describe('POST /message/{channelId} [send message to channel]', () => {
  let database: Sequelize;
  let server: FastifyInstance;
  let enableSync: boolean;

  beforeAll(async () => {
    database = await setupDatabase(false);
    server = setupServer(database);
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

  it('should return bad request after sending non-HEX message to a channel', async () => {
    const { channelId } = defaultMessage;
    const message = 'non HEX message';

    let request = await sendMessageToChannel(server, { channelId, message });
    request = request.json();

    expect(request).toHaveProperty('statusCode', STATUS_CODES.BAD_REQUEST);
  });

  it('should return bad request after sending a message with a larger size than allowed', async () => {
    const { channelId } = defaultMessage;
    const message = 'A'.repeat(MAX_MESSAGE_LENGTH + 1);

    let request = await sendMessageToChannel(server, { channelId, message });
    request = request.json();

    expect(request).toHaveProperty('statusCode', STATUS_CODES.BAD_REQUEST);
  });

  it('should return bad request after sending a channelId bigger than allowed', async () => {
    const { message } = defaultMessage;
    const channelId = 'C'.repeat(MAX_CHANNEL_LENGTH + 1);

    const request = await sendMessageToChannel(server, { channelId, message });

    expect(request.json()).toHaveProperty('statusCode', STATUS_CODES.BAD_REQUEST);
  });

  it('should return creation date after sending message with allowed sizes for channelId and message', async () => {
    const channelId = 'C'.repeat(MAX_CHANNEL_LENGTH);
    const message = 'A'.repeat(MAX_MESSAGE_LENGTH);

    let request = await sendMessageToChannel(server, { channelId, message });
    request = request.json();

    expect(request).toHaveProperty('createdAt');
    expect(request).toHaveProperty('channelId', channelId);
  });

  it('should return creation date after sending valid message to a channel', async () => {
    const { channelId } = defaultMessage;
    const message = 'FF00AA112345';

    let request = await sendMessageToChannel(server, { channelId, message });
    request = request.json();

    expect(request).toHaveProperty('createdAt');
    expect(request).toHaveProperty('channelId', channelId);
  });

  it('should store messages after send valid message to a channel', async () => {
    const { channelId } = defaultMessage;
    const firstMessage = 'ABDE';
    const secondMessage = '12345';

    await sendMessageToChannel(server, { channelId, message: firstMessage });
    await sendMessageToChannel(server, { channelId, message: secondMessage });
    const request = await getMessagesFromChannel(server, { channelId });
    const messages = request.json();

    const channelMessages = messages.filter((item: MessageStored) => item.channelId === channelId);
    const firstStoredMessage = channelMessages.find((item: MessageStored) => item.message === firstMessage);
    const secondStoredMessage = channelMessages.find((item: MessageStored) => item.message === secondMessage);

    expect(channelMessages).toHaveLength(2);
    expect(firstStoredMessage).toHaveProperty('message', firstMessage);
    expect(secondStoredMessage).toHaveProperty('message', secondMessage);
  });

  it('should store only unique messages to a channel', async () => {
    const channelId = 'another_new_channel';
    const message = 'ABDE';

    await sendMessageToChannel(server, { channelId, message });

    const from = moment().toISOString();

    await sendMessageToChannel(server, { channelId, message });
    const request = await getMessagesFromChannel(server, { channelId });
    const result = request.json();

    const firstMessageStored = result.some((item: MessageStored) => item.createdAt < from);

    expect(firstMessageStored).toBeTruthy();
    expect(result).toHaveLength(1);
  });
});
