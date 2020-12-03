import { WalletRepository } from '../db/wallet-repository';
import { CoSigner, PubKey, Transaction, Wallet, WalletId, WalletState, WalletStateResponse } from '../models';
import { JoinWalletResult, JoinWalletResults } from './wallet-service-helper';

export interface WalletService {
  newTransactionProposal(
    walletId: string,
    body: Components.RequestBodies.TransactionProposal
  ): Promise<{ valid: boolean; reason?: string; transaction?: Transaction }>;
  createWallet(walletName: string, m: number, n: number, cosigner: CoSigner): Promise<WalletId>;
  getWalletState(walletId: string): Promise<{ valid: boolean; wallet?: WalletStateResponse }>;
  joinWallet(walletId: string, cosigner: CoSigner): Promise<JoinWalletResult>;
  hasWallet(walletId: string): Promise<boolean>;
  isCosigner(walletId: string, pubKey: PubKey): Promise<boolean>;
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
    const walletFound = await repository.findWallet(walletId);
    if (walletFound.valid && walletFound.wallet) {
      const cosigners: CoSigner[] = await repository.findCosigners(walletId);
      const walletState: WalletState = getWalletState(walletFound.wallet, cosigners.length);
      const pendingTxs = await repository.countPendingTransactions(walletId);
      const walletResponse: WalletStateResponse = {
        ...walletFound.wallet,
        walletState,
        pendingTxs: pendingTxs.valid ? pendingTxs.pendingTxs! : 0,
        cosigners
      };

      return {
        valid: true,
        wallet: walletResponse
      };
    }
    return { valid: false };
  },
  joinWallet: async (walletId, joiningCosigner) => {
    const walletFound = await repository.findWallet(walletId);
    if (walletFound.valid && walletFound.wallet) {
      const cosigners: CoSigner[] = await repository.findCosigners(walletId);
      const isAlreadyCosigner = cosigners.find(cosigner => cosigner.pubKey === joiningCosigner.pubKey);
      if (isAlreadyCosigner) {
        return JoinWalletResults.alreadyJoined;
      }
      if (cosigners.length >= walletFound.wallet.n) {
        return JoinWalletResults.walletFull;
      }
      const result = await repository.joinWallet(walletId, joiningCosigner);

      return result
        ? JoinWalletResults.joinOK(getWalletState(walletFound.wallet, cosigners.length + 1))
        : JoinWalletResults.walletNotFound;
    }
    return JoinWalletResults.walletNotFound;
  },
  newTransactionProposal: async (walletId, transactionProposal) => {
    const isCosigner = await repository.isCosigner(walletId, transactionProposal.issuer);
    if (isCosigner) {
      return await repository.createTransaction(walletId, transactionProposal);
    }
    return { valid: false };
  },
  hasWallet: async walletId => (await repository.findWallet(walletId)).valid,
  isCosigner: async (walletId, pubKey) => await repository.isCosigner(walletId, pubKey)
});

export default configure;
