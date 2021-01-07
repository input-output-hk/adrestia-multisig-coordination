declare namespace Components {
  namespace RequestBodies {
    export type CreateWallet = Schemas.WalletCreation;
    export type JoinWallet = Schemas.CoSigner;
    export interface SignProposal {
      issuer: Schemas.PubKey;
    }
    export interface TransactionProposal {
      issuer: Schemas.PubKey;
      tx: Schemas.UnsignedTransaction;
    }
  }
  namespace Responses {
    export interface CreateWallet {
      walletId: Schemas.WalletId;
    }
    export interface JoinWallet {
      walletState: Schemas.WalletState;
    }
    export type SignTransaction = Schemas.Transaction;
    export type TransactionProposal = Schemas.Transaction;
    export type TransactionProposals = Schemas.Transaction[];
    export type WalletState = Schemas.Wallet;
  }
  namespace Schemas {
    export interface CoSigner {
      cosignerAlias: CoSignerAlias;
      pubKey: PubKey;
    }
    export type CoSignerAlias = string;
    export interface ErrorResponse {
      statusCode: number;
      message: string;
    }
    export type PubKey = string;
    export interface Transaction {
      transactionId: TransactionId;
      unsignedTransaction: UnsignedTransaction;
      transactionState: TransactionState;
      createdAt: string; // date
      updatedAt: string; // date
    }
    export type TransactionId = string;
    export type TransactionState = 'WaitingForSignatures' | 'Signed' | 'Expired';
    export type UnsignedTransaction = string;
    export interface Wallet {
      id: WalletId;
      name: string;
      m: number;
      n: number;
      state: WalletState;
      cosigners: CoSigner[];
      pendingTxs: number;
      createdAt: string; // date
      initiator: PubKey;
    }
    export interface WalletCreation {
      walletName: string;
      m: number;
      n: number;
      cosigner: CoSigner;
    }
    export type WalletId = string;
    export type WalletState = 'WaitingForCosigners' | 'Ready' | 'Expired';
  }
}
declare namespace Paths {
  namespace CreateWallet {
    export type RequestBody = Components.RequestBodies.CreateWallet;
    namespace Responses {
      export type $200 = Components.Responses.CreateWallet;
      export type $400 = Components.Schemas.ErrorResponse;
      export type $500 = Components.Schemas.ErrorResponse;
    }
  }
  namespace GetTransactionProposals {
    namespace Parameters {
      export type Cosigner = string;
      export type From = string; // date
      export type OnlyPending = boolean;
      export type WalletId = string;
    }
    export interface PathParameters {
      walletId: Parameters.WalletId;
    }
    export interface QueryParameters {
      from?: Parameters.From /* date */;
      onlyPending?: Parameters.OnlyPending;
      cosigner?: Parameters.Cosigner;
    }
    namespace Responses {
      export type $200 = Components.Responses.TransactionProposals;
      export type $404 = Components.Schemas.ErrorResponse;
      export type $500 = Components.Schemas.ErrorResponse;
    }
  }
  namespace GetWalletState {
    namespace Parameters {
      export type WalletId = string;
    }
    export interface PathParameters {
      walletId: Parameters.WalletId;
    }
    namespace Responses {
      export type $200 = Components.Responses.WalletState;
      export type $404 = Components.Schemas.ErrorResponse;
      export type $500 = Components.Schemas.ErrorResponse;
    }
  }
  namespace JoinWallet {
    namespace Parameters {
      export type WalletId = string;
    }
    export interface PathParameters {
      walletId: Parameters.WalletId;
    }
    export type RequestBody = Components.RequestBodies.JoinWallet;
    namespace Responses {
      export type $200 = Components.Responses.JoinWallet;
      export type $400 = Components.Schemas.ErrorResponse;
      export type $404 = Components.Schemas.ErrorResponse;
      export type $500 = Components.Schemas.ErrorResponse;
    }
  }
  namespace NewTransactionProposal {
    namespace Parameters {
      export type WalletId = string;
    }
    export interface PathParameters {
      walletId: Parameters.WalletId;
    }
    export type RequestBody = Components.RequestBodies.TransactionProposal;
    namespace Responses {
      export type $200 = Components.Responses.TransactionProposal;
      export type $400 = Components.Schemas.ErrorResponse;
      export type $404 = Components.Schemas.ErrorResponse;
      export type $500 = Components.Schemas.ErrorResponse;
    }
  }
  namespace SignTransaction {
    namespace Parameters {
      export type TxId = string;
    }
    export interface PathParameters {
      txId: Parameters.TxId;
    }
    export type RequestBody = Components.RequestBodies.SignProposal;
    namespace Responses {
      export type $200 = Components.Responses.SignTransaction;
      export type $400 = Components.Schemas.ErrorResponse;
      export type $404 = Components.Schemas.ErrorResponse;
      export type $500 = Components.Schemas.ErrorResponse;
    }
  }
}
