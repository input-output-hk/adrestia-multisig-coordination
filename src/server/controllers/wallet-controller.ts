import { FastifyRequest, Logger } from 'fastify';
import { WalletStateResponse } from '../models';
import { WalletService } from '../services/wallet-service';
import { JoinWalletResults } from '../services/wallet-service-helper';
import { mapToWalletCreationResponse } from '../utils/data-mapper';
import { ErrorFactory } from '../utils/errors';
import { withValidWalletInput } from './wallet-controller-helper';

export interface WalletController {
  createWallet(
    request: FastifyRequest<unknown, unknown, unknown, unknown, Components.RequestBodies.CreateWallet>
  ): Promise<Components.Responses.CreateWallet | Components.Schemas.ErrorResponse>;
  getWalletState(request: FastifyRequest): Promise<WalletStateResponse>;
  joinWallet(
    request: FastifyRequest<
      unknown,
      unknown,
      Paths.JoinWallet.PathParameters,
      unknown,
      Components.RequestBodies.JoinWallet
    >
  ): Promise<Components.Responses.JoinWallet | Components.Schemas.ErrorResponse>;
}

const configure = (walletService: WalletService): WalletController => ({
  createWallet: async request => {
    const requestBody: Components.RequestBodies.CreateWallet = request.body;
    const logger: Logger = request.log;
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
  },
  getWalletState: async request => {
    const walletState = await walletService.getWalletState(request.params.walletId);
    if (!walletState) {
      throw ErrorFactory.walletNotFound;
    }

    return walletState;
  },
  joinWallet: async request => {
    const result = await walletService.joinWallet(request.params.walletId, request.body);
    if (result.success && result.walletState) {
      return { walletState: result.walletState };
    }
    if (result === JoinWalletResults.walletFull) {
      throw ErrorFactory.walletIsFull;
    } else if (result === JoinWalletResults.alreadyJoined) {
      throw ErrorFactory.alreadyJoined;
    }
    throw ErrorFactory.walletNotFound;
  }
});

export default configure;
