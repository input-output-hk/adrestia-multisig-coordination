import ApiError from '../api-error';

export interface CustomError {
  message: string;
  code: number;
}

export const Errors = {
  // Generic
  WALLET_NOT_FOUND: { message: 'Wallet not found', code: 404 },
  WALLET_EXPIRED: { message: 'Wallet Expired', code: 400 },

  // Create Wallet
  INVALID_WALLET_INPUT_M_SMALLER_N: { message: 'm should be smaller than n', code: 400 },
  INVALID_WALLET_INPUT_N: { message: 'n should be greater than 0', code: 400 },
  INVALID_WALLET_INPUT_M: { message: 'm should be greater than 0', code: 400 },
  WALLET_NAME_EMPTY: { message: 'walletName should not be empty', code: 400 },
  INVALID_PUBKEY: { message: 'pubKey is not a valid Cardano Public Key', code: 400 },

  // Create Proposal
  ISSUER_NOT_COSIGNER: { message: 'Issuer is not Cosigner', code: 400 },
  WALLET_NOT_READY: { message: 'Wallet state is WaitingForCosigners', code: 400 },

  // Join
  ALREADY_JOINED: { message: 'Already joined', code: 400 },
  WALLET_FULL: { message: 'Wallet is full', code: 400 },

  // Sign
  COSIGNER_NOT_FOUND: { message: 'Cosigner Not Found', code: 404 },
  INVALID_COSIGNER: { message: 'Invalid Cosigner', code: 400 },
  ALREADY_SIGNED: { message: 'Transaction was already signed', code: 400 },
  ALREADY_SIGNED_BY: { message: 'Already Signed', code: 400 },
  INVALID_TRANSACTION: { message: 'Invalid Transaction', code: 400 },
  TRANSACTION_NOT_FOUND: { message: 'Transaction Not Found', code: 404 }
};

export const buildApiError = (error: CustomError): ApiError => new ApiError(error.code, error.message);

const walletNotFound = buildApiError(Errors.WALLET_NOT_FOUND);
const walletExpired = buildApiError(Errors.WALLET_EXPIRED);

const invalidWalletMAndN = buildApiError(Errors.INVALID_WALLET_INPUT_M_SMALLER_N);
const invalidWalletM = buildApiError(Errors.INVALID_WALLET_INPUT_M);
const invalidWalletN = buildApiError(Errors.INVALID_WALLET_INPUT_N);
const invalidWalletName = buildApiError(Errors.WALLET_NAME_EMPTY);
const invalidPubKey = buildApiError(Errors.INVALID_PUBKEY);

const issuerNotCosigner = buildApiError(Errors.ISSUER_NOT_COSIGNER);
const walletNotReady = buildApiError(Errors.WALLET_NOT_READY);

const alreadyJoined = buildApiError(Errors.ALREADY_JOINED);
const walletIsFull = buildApiError(Errors.WALLET_FULL);

const cosignerNotFound = buildApiError(Errors.COSIGNER_NOT_FOUND);
const invalidCosigner = buildApiError(Errors.INVALID_COSIGNER);
const alreadySignedBy = buildApiError(Errors.ALREADY_SIGNED_BY);
const alreadySigned = buildApiError(Errors.ALREADY_SIGNED);
const invalidTranscation = buildApiError(Errors.INVALID_TRANSACTION);
const transactionNotFound = buildApiError(Errors.TRANSACTION_NOT_FOUND);

export const ErrorFactory = {
  walletNotFound,
  walletExpired,

  invalidPubKey,
  invalidWalletName,
  invalidWalletMAndN,
  invalidWalletM,
  invalidWalletN,

  issuerNotCosigner,
  walletNotReady,

  alreadyJoined,
  walletIsFull,

  cosignerNotFound,
  invalidCosigner,
  alreadySignedBy,
  alreadySigned,
  invalidTranscation,
  transactionNotFound
};
