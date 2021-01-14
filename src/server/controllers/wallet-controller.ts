import { FastifyRequest, Logger } from 'fastify';
import { WalletService } from '../services/wallet-service';
import { ErrorFactory } from '../utils/errors';
import { isValidKey, withValidWalletInput } from './wallet-controller-helper';

export interface WalletController {
  createWallet(
    request: FastifyRequest<unknown, unknown, unknown, unknown, Components.RequestBodies.CreateWallet>
  ): Promise<Components.Responses.CreateWallet | Components.Schemas.ErrorResponse>;
  getWalletState(request: FastifyRequest): Promise<Components.Schemas.Wallet>;
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
  getTransactionProposals(
    request: FastifyRequest<
      unknown,
      Paths.GetTransactionProposals.QueryParameters,
      Paths.GetTransactionProposals.PathParameters,
      unknown,
      unknown
    >
  ): Promise<Components.Responses.TransactionProposals | Components.Schemas.ErrorResponse>;
  signTransaction(
    request: FastifyRequest<
      unknown,
      unknown,
      Paths.SignTransaction.PathParameters,
      unknown,
      Components.RequestBodies.SignProposal
    >
  ): Promise<Components.Responses.SignTransaction | Components.Schemas.ErrorResponse>;
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

      return {
        walletId: walletResult
      };
    });
  },
  getWalletState: async request => {
    const logger: Logger = request.log;
    logger.info(`[getWalletState] Request received with body ${request.body}`);
    return await walletService.getWallet(request.params.walletId);
  },
  joinWallet: async request => {
    const logger: Logger = request.log;
    logger.info(`[joinWallet] Request received with body ${request.body}`);
    if (!isValidKey(request.body)) {
      throw ErrorFactory.invalidPubKey;
    }
    return { walletState: await walletService.joinWallet(request.params.walletId, request.body) };
  },
  newTransactionProposal: async request => {
    const logger: Logger = request.log;
    logger.info(`[newTransactionProposal] Request received with body ${request.body}`);
    if (request.body.tx.length === 0 || request.body.witness.length === 0) {
      throw ErrorFactory.invalidTranscation;
    }
    return await walletService.newTransactionProposal(request.params.walletId, request.body);
  },
  getTransactionProposals: async request => {
    const logger: Logger = request.log;
    const from = request.query.from;
    const pending = request.query.onlyPending;
    const cosigner = request.query.cosigner;
    logger.info(
      `[getTransactionProposals] Request received with query params
        from: ${from} - onlyPending: ${pending} - cosigner: ${cosigner}`
    );
    return await walletService.getTransactions(request.params.walletId, from, pending, cosigner);
  },
  signTransaction: async request => {
    const logger: Logger = request.log;
    logger.info(`[signTransaction] Request received with request body ${request.body} and params ${request.params}`);

    const transactionId = request.params.txId;
    const issuer = request.body.issuer;
    const witness = request.body.witness;

    return await walletService.signTransaction(transactionId, issuer, witness);
  }
});

export default configure;
