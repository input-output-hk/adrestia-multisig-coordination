export type WalletId = Components.Schemas.WalletId;
export type WalletState = Components.Schemas.WalletState;

export type PubKey = Components.Schemas.PubKey;
export type CoSignerAlias = Components.Schemas.CoSignerAlias;

export type TransactionId = Components.Schemas.TransactionId;
export type TransactionState = Components.Schemas.TransactionState;
export type UnsignedTransaction = string;
export interface CoSigner {
  alias: CoSignerAlias;
  pubKey: PubKey;
}

export interface Wallet {
  walletId: WalletId;
  walletState: WalletState;
  m: number;
  n: number;
  createDate: string;
  pendingTxs: number;
  cosigners: CoSigner[];
}

export interface Transaction {
  txId: TransactionId;
  unsignedTransaction: UnsignedTransaction;
  transactionState: TransactionState;
  creationDate: string;
  updateDate: string;
}
