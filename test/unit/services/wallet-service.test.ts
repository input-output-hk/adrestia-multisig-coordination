import { WalletRepository } from '../../../src/server/db/wallet-repository';
import { CoSigner, Wallet } from '../../../src/server/models';
import configure, { WalletService } from '../../../src/server/services/wallet-service';
import { JoinWalletResult, JoinWalletResults } from '../../../src/server/services/wallet-service-helper';

describe('Wallet Service', () => {
  let walletService: WalletService;

  const mockCosigner: Components.Schemas.CoSigner = {
    cosignerAlias: 'someAlias',
    pubKey: 'someValidKey'
  };

  const mockWallet: Wallet = {
    walletId: 'someId',
    walletName: 'someName',
    initiator: mockCosigner.pubKey,
    createdAt: new Date().toString(),
    m: 2,
    n: 3
  };

  const mockRepository: WalletRepository = {
    createWallet: async () => 'someId',
    findWallet: async () => mockWallet,
    findCosigners: async () => [mockCosigner],
    countPendingTransactions: async () => 0,
    joinWallet: async () => true
  };

  beforeAll(() => {
    walletService = configure(mockRepository);
  });

  describe('Wallet creation', () => {
    it('Return someId', async () => {
      const m = 2;
      const n = 3;
      expect(await walletService.createWallet('someName', m, n, mockCosigner)).toBe('someId');
    });

    it('Get wallet state', async () => {
      const walletState = await walletService.getWalletState('someId');
      expect(walletState?.initiator).toBe(mockCosigner.pubKey);
      expect(walletState?.walletId).toBe('someId');
      expect(walletState?.walletState).toBe('WaitingForCosigners');
    });

    it('Join Wallet returns wallet state', async () => {
      const m = 2;
      const n = 3;
      expect(await walletService.createWallet('someName', m, n, mockCosigner)).toBe('someId');
      const cosigner: CoSigner = {
        cosignerAlias: 'someAlias',
        pubKey: 'someKey'
      };
      const result: JoinWalletResult = await walletService.joinWallet('someId', cosigner);
      expect(result.success).toBeTruthy();
      expect(result.walletState).toBe('WaitingForCosigners');
    });
  });
});
