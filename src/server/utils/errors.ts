import ApiError from '../api-error';

export interface CustomError {
  message: string;
  code: number;
}

export const Errors = {
  WALLET_NOT_FOUND: { message: 'Wallet not found.', code: 404 },
  INVALID_WALLET_INPUT_M_SMALLER_N: { message: 'm should be smaller than n', code: 400 },
  INVALID_WALLET_INPUT_N: { message: 'n should be greater than 0', code: 400 },
  INVALID_WALLET_INPUT_M: { message: 'm should be greater than 0', code: 400 },
  WALLET_NAME_EMPTY: { message: 'walletName should not be empty.', code: 400 },
  INVALID_PUBKEY: { message: 'pubKey is not a valid Cardano Public Key', code: 400 }
};

export const buildApiError = (error: CustomError): ApiError => new ApiError(error.code, error.message);

const invalidWalletMAndN = buildApiError(Errors.INVALID_WALLET_INPUT_M_SMALLER_N);
const invalidWalletM = buildApiError(Errors.INVALID_WALLET_INPUT_M);
const invalidWalletN = buildApiError(Errors.INVALID_WALLET_INPUT_N);
const invalidWalletName = buildApiError(Errors.WALLET_NAME_EMPTY);
const invalidPubKey = buildApiError(Errors.INVALID_PUBKEY);
const walletNotFound = buildApiError(Errors.WALLET_NOT_FOUND);

export const ErrorFactory = {
  invalidPubKey,
  invalidWalletName,
  invalidWalletMAndN,
  invalidWalletM,
  invalidWalletN,
  walletNotFound
};
