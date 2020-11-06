import fastify from 'fastify';
import fastifyBlipp from 'fastify-blipp';
import openapiGlue from 'fastify-openapi-glue';
import { Services } from './services/services';
import * as Controllers from './controllers/controllers';
import { IncomingMessage, Server, ServerResponse } from 'http';

interface ExtraParams {
  networkId: string;
  pageSize: number;
}

/**
 * This function builds a Fastify instance connecting the services with the
 * corresponding fastify route handlers.
 *
 * @param services to be used to handle the requests
 * @param logger true if logger should be enabled, false otherwise
 */
const buildServer = (
  services: Services,
  logLevel: string
): fastify.FastifyInstance<Server, IncomingMessage, ServerResponse> => {
  const server = fastify({ logger: { level: logLevel } });
  server.register(fastifyBlipp);
  server.register(openapiGlue, {
    specification: `${__dirname}/openApi.json`,
    service: Controllers.configure(services),
    noAdditional: true
  });

  return server;
};

export default buildServer;
