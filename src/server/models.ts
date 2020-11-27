export type WalletId = Components.Schemas.WalletId;
export type WalletState = Components.Schemas.WalletState;

export type PubKey = Components.Schemas.PubKey;
export type CoSignerAlias = Components.Schemas.CoSignerAlias;

export type TransactionId = Components.Schemas.TransactionId;
export type TransactionState = Components.Schemas.TransactionState;
export type UnsignedTransaction = string;
export type CoSigner = Components.Schemas.CoSigner;

export interface Wallet {
  walletId: WalletId;
  walletName: string;
  m: number;
  n: number;
  createdAt: string;
  initiator: PubKey;
}

export interface Transaction {
  txId: TransactionId;
  unsignedTransaction: UnsignedTransaction;
  transactionState: TransactionState;
  createdAt: string;
  updatedAt: string;
  issuer: PubKey;
}

export type WalletStateResponse = Wallet & {
  walletState: WalletState;
  pendingTxs: number;
  cosigners: CoSigner[];
};
