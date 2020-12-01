import { WalletRepository } from '../db/wallet-repository';
import { CoSigner, Wallet, WalletId, WalletState, WalletStateResponse } from '../models';
import { JoinWalletResult, JoinWalletResults } from './wallet-service-helper';

export interface WalletService {
  createWallet(walletName: string, m: number, n: number, cosigner: CoSigner): Promise<WalletId>;
  getWalletState(walletId: string): Promise<WalletStateResponse | undefined>;
  joinWallet(walletId: string, cosigner: CoSigner): Promise<JoinWalletResult>;
}

const hasExpired = (createdAt: string) => false; // @todo implement

const mapToWalletState = (countCosigners: number, n: number, date: string) => {
  if (countCosigners === n) {
    return 'Ready';
  } else if (hasExpired(date)) {
    return 'Expired';
  }
  return 'WaitingForCosigners';
};

const getWalletState = (wallet: Wallet, countCosigners: number) =>
  mapToWalletState(countCosigners, wallet.n, wallet.createdAt);

const configure = (repository: WalletRepository): WalletService => ({
  createWallet: async (walletName, m, n, cosigner) => await repository.createWallet(walletName, m, n, cosigner),
  getWalletState: async walletId => {
    const wallet: Wallet | undefined = await repository.findWallet(walletId);
    if (wallet) {
      const cosigners: CoSigner[] = await repository.findCosigners(walletId);
      const walletState: WalletState = getWalletState(wallet, cosigners.length);
      const pendingTxs = await repository.countPendingTransactions(walletId);

      return {
        ...wallet,
        walletState,
        pendingTxs: pendingTxs ? pendingTxs : 0,
        cosigners
      };
    }
    return wallet;
  },
  joinWallet: async (walletId, joiningCosigner) => {
    const wallet: Wallet | undefined = await repository.findWallet(walletId);
    if (wallet) {
      const cosigners: CoSigner[] = await repository.findCosigners(walletId);
      const isAlreadyCosigner = cosigners.find(cosigner => cosigner.pubKey === joiningCosigner.pubKey);
      if (isAlreadyCosigner) {
        return JoinWalletResults.alreadyJoined;
      }
      if (cosigners.length >= wallet.n) {
        return JoinWalletResults.walletFull;
      }
      const result = await repository.joinWallet(walletId, joiningCosigner);

      return result
        ? JoinWalletResults.joinOK(getWalletState(wallet, cosigners.length + 1))
        : JoinWalletResults.walletNotFound;
    }
    return JoinWalletResults.walletNotFound;
  }
});

export default configure;
