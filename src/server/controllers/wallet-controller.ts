import { FastifyRequest, Logger } from 'fastify';
import { WalletService } from '../services/wallet-service';
import { mapToWalletCreationResponse } from '../utils/data-mapper';
import { withValidWalletInput } from './wallet-controller-helper';

export interface WalletController {
  createWallet(
    request: FastifyRequest<unknown, unknown, unknown, unknown, Components.RequestBodies.CreateWallet>
  ): Promise<Components.Responses.CreateWallet | Components.Schemas.ErrorResponse>;
}

const configure = (walletService: WalletService): WalletController => ({
  createWallet: async request => {
    const requestBody: Components.RequestBodies.CreateWallet = request.body;
    const logger = request.log;
    logger.info(`[createWallet] Request received with body ${requestBody}`);

    return withValidWalletInput(logger, requestBody, async validRequestBody => {
      const walletResult = await walletService.createWallet(
        validRequestBody.walletName,
        validRequestBody.m,
        validRequestBody.n,
        validRequestBody.cosigner
      );

      return mapToWalletCreationResponse(walletResult);
    });
  }
});

export default configure;
