import { WalletState } from '../models';

export interface JoinWalletResult {
  success: boolean;
  reason?: string;
  walletState?: WalletState;
}

export const joinOK = (walletState: WalletState): JoinWalletResult => ({
  success: true,
  walletState
});
const walletNotFound: JoinWalletResult = {
  success: false,
  reason: 'Wallet not found'
};
const alreadyJoined: JoinWalletResult = {
  success: false,
  reason: 'Already joined'
};
const walletFull: JoinWalletResult = {
  success: false,
  reason: 'Wallet is full'
};

export const JoinWalletResults = {
  joinOK,
  alreadyJoined,
  walletFull,
  walletNotFound
};
