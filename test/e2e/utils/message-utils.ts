import { FastifyInstance, HTTPInjectResponse } from 'fastify';
import { MessageAttributes } from '../../../src/server/model/message';
import { addQueryToUrl } from './test-utils';

type ChannelId = Components.Schemas.ChannelId;

type FindQuery = {
  channelId: ChannelId;
  from?: string;
};

const sendMessageToChannel = async (server: FastifyInstance, payload: MessageAttributes): Promise<HTTPInjectResponse> =>
  await server.inject({
    method: 'post',
    headers: {
      'content-type': 'application/json'
    },
    url: `/messages/${payload.channelId}`,
    payload: { message: payload.message }
  });

const getMessagesFromChannel = async (server: FastifyInstance, payload: FindQuery): Promise<HTTPInjectResponse> => {
  const { channelId, from } = payload;

  const url = addQueryToUrl(`/messages/${channelId}`, { from });

  return await server.inject({
    method: 'get',
    url
  });
};

export { getMessagesFromChannel, sendMessageToChannel };
