import { FastifyRequest, Logger } from 'fastify';
import { WalletId, WalletStateResponse } from '../models';
import { WalletService } from '../services/wallet-service';
import { JoinWalletResults } from '../services/wallet-service-helper';
import { mapToWalletCreationResponse, mapTransactionToTransactionResponse } from '../utils/data-mapper';
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
  newTransactionProposal(
    request: FastifyRequest<
      unknown,
      unknown,
      Paths.NewTransactionProposal.PathParameters,
      unknown,
      Components.RequestBodies.TransactionProposal
    >
  ): Promise<Components.Responses.TransactionProposal | Components.Schemas.ErrorResponse>;
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
    const logger: Logger = request.log;
    logger.info(`[getWalletState] Request received with body ${request.body}`);
    const walletState = await walletService.getWalletState(request.params.walletId);
    if (walletState.valid && walletState.wallet) {
      return walletState.wallet;
    }
    throw ErrorFactory.walletNotFound;
  },
  joinWallet: async request => {
    const logger: Logger = request.log;
    logger.info(`[joinWallet] Request received with body ${request.body}`);
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
  },
  newTransactionProposal: async request => {
    const logger: Logger = request.log;
    logger.info(`[newTransactionProposal] Request received with body ${request.body}`);
    const hasWallet = await walletService.hasWallet(request.params.walletId);
    if (!hasWallet) {
      throw ErrorFactory.walletNotFound;
    }

    const isCosigner = await walletService.isCosigner(request.params.walletId, request.body.issuer);
    if (!isCosigner) {
      throw ErrorFactory.invalidPubKey;
    }
    const result = await walletService.newTransactionProposal(request.params.walletId, request.body);
    if (result.valid && result.transaction) {
      return mapTransactionToTransactionResponse(result.transaction);
    }
    throw ErrorFactory.walletNotFound;
  }
});

export default configure;
