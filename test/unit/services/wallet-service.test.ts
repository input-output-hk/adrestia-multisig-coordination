import { WalletRepository } from '../../../src/server/db/wallet-repository';
import configure, { WalletService } from '../../../src/server/services/wallet-service';

describe('Wallet Service', () => {
  let walletService: WalletService;

  const mockRepository: WalletRepository = {
    async createWallet(walletName, m, n, cosigner) {
      return Promise.resolve('someId');
    }
  };

  beforeAll(() => {
    walletService = configure(mockRepository);
  });

  describe('Wallet creation', () => {
    it('Return someId', async () => {
      const cosigner: Components.Schemas.CoSigner = {
        cosignerAlias: 'someAlias',
        pubKey: 'someKey'
      };
      const m = 2;
      const n = 3;
      expect(await walletService.createWallet('someName', m, n, cosigner)).toBe('someId');
    });
  });
});
