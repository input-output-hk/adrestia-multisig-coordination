import { QueryResultRow } from 'pg';
import { Transaction, Wallet } from '../models';
/* eslint-disable camelcase */

export const mapToWalletCreationResponse = (result: string): Components.Responses.CreateWallet => ({
  walletId: result
});

export const mapToWallet = (result: QueryResultRow): Wallet => {
  const { id, wallet_name, n, m, created_at, initiator } = result;
  return {
    walletId: id,
    walletName: wallet_name,
    n,
    m,
    createdAt: created_at,
    initiator
  };
};

export const mapTransactionToTransactionResponse = (result: Transaction): Components.Responses.TransactionProposal => ({
  transactionId: result.txId,
  transactionState: result.transactionState,
  createdAt: result.createdAt,
  updatedAt: result.updatedAt,
  unsignedTransaction: result.unsignedTransaction
});
