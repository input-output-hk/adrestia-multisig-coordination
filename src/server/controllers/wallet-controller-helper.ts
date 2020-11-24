import { Logger } from 'fastify';
import { CoSigner } from '../models';
import { ErrorFactory } from '../utils/errors';

const isValidKey = (cosigner: CoSigner) => cosigner.pubKey.length !== 0; // @todo implement

export const withValidWalletInput = async <R>(
  logger: Logger,
  requestBody: Components.RequestBodies.CreateWallet,
  create: (validRequestBody: Components.RequestBodies.CreateWallet) => R
): Promise<R> => {
  if (requestBody.m <= 0) {
    logger.error(ErrorFactory.invalidWalletM.message);
    throw ErrorFactory.invalidWalletM;
  }
  if (requestBody.m > requestBody.n) {
    logger.error('m should be smaller than n');
    throw ErrorFactory.invalidWalletMAndN;
  }
  if (requestBody.walletName.length === 0) {
    logger.error('walletName should not be empty');
    throw ErrorFactory.invalidWalletName;
  }
  if (!isValidKey(requestBody.cosigner)) {
    logger.error('pubKey should be valid');
    throw ErrorFactory.invalidPubKey;
  }
  return create(requestBody);
};
