import { WalletRepository } from '../db/wallet-repository';
import { CoSigner, Wallet, WalletId, WalletState, WalletStateResponse } from '../models';

export interface WalletService {
  createWallet(walletName: string, m: number, n: number, cosigner: CoSigner): Promise<WalletId>;
  getWalletState(walletId: string): Promise<WalletStateResponse | undefined>;
}

const hasExpired = (createDate: string) => false; // @todo implement

const mapToWalletState = (countCosigners: number, m: number, date: string) => {
  if (countCosigners === m) {
    return 'Ready';
  } else if (hasExpired(date)) {
    return 'Expired';
  }
  return 'WaitingForCosigners';
};

const getWalletState = (wallet: Wallet, countCosigners: number) =>
  mapToWalletState(countCosigners, wallet.m, wallet.createDate);

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
  }
});

export default configure;
