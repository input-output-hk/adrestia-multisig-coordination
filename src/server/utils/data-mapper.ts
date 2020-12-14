import Transaction from '../model/transaction';
import Wallet from '../model/wallet';
import { TransactionState, WalletState } from '../models';

export const toTransactionResponse = (
  result: Transaction,
  state: TransactionState
): Components.Responses.TransactionProposal => ({
  transactionId: result.id,
  transactionState: state,
  createdAt: result.createdAt.toDateString(),
  updatedAt: result.updatedAt.toDateString(),
  unsignedTransaction: result.unsignedTransaction
});

export const toWalletResponse = (
  wallet: Wallet,
  walletState: WalletState,
  pendingTxs: number,
  initiator: string,
  cosigners: Components.Schemas.CoSigner[]
): Components.Responses.WalletState => ({
  id: wallet.id,
  name: wallet.name,
  m: wallet.m,
  n: wallet.n,
  initiator,
  createdAt: wallet.createdAt.toDateString(),
  pendingTxs,
  state: walletState,
  cosigners
});
