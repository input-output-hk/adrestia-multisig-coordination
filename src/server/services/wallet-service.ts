import { WalletRepository } from '../db/wallet-repository';
import { CoSigner, WalletId } from '../models';

export interface WalletService {
  createWallet(walletName: string, m: number, n: number, cosigner: CoSigner): Promise<WalletId>;
}

const configure = (repository: WalletRepository): WalletService => ({
  async createWallet(walletName, m, n, cosigner) {
    return await repository.createWallet(walletName, m, n, cosigner);
  }
});

export default configure;
