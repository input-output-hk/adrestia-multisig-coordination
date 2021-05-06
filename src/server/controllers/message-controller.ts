import { FastifyRequest, Logger } from 'fastify';
import { MessageService } from '../services/message-service';

export interface MessageController {
  sendMessage(
    request: FastifyRequest<
      unknown,
      unknown,
      Paths.SendMessage.PathParameters,
      unknown,
      Components.RequestBodies.Message
    >
  ): Promise<Components.Responses.Message | Components.Schemas.ErrorResponse>;

  getMessages(
    request: FastifyRequest<unknown, Paths.GetMessages.QueryParameters, Paths.GetMessages.PathParameters>
  ): Promise<Components.Responses.Messages | Components.Schemas.ErrorResponse>;
}

const configure = (messageService: MessageService): MessageController => ({
  sendMessage: async request => {
    const logger: Logger = request.log;
    logger.info(`[newMessage] Request received with body ${JSON.stringify(request.body)}`);
    return await messageService.sendMessage(request.params.channelId, request.body.message);
  },

  getMessages: async request => {
    const logger: Logger = request.log;
    const channelId = request.params.channelId;
    const from = request.query?.from;
    logger.info(
      `[getMessages] Request received with query params
        from: ${from}`
    );
    return await messageService.getMessages(channelId, from);
  }
});

export default configure;
