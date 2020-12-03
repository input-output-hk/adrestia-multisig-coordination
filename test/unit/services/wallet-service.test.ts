import { WalletRepository } from '../../../src/server/db/wallet-repository';
import { CoSigner, Transaction, Wallet } from '../../../src/server/models';
import configure, { WalletService } from '../../../src/server/services/wallet-service';
import { JoinWalletResult } from '../../../src/server/services/wallet-service-helper';
import { defaultCosigner } from '../../e2e/wallet/wallet-test-utils';

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

  const mockTransaction: Transaction = {
    txId: 'someId',
    transactionState: 'WaitingForSignatures',
    unsignedTransaction: 'someTransactionToBeSigned',
    createdAt: new Date().toString(),
    updatedAt: new Date().toString(),
    issuer: 'someKey'
  };

  const mockRepository: WalletRepository = {
    createWallet: async () => 'someId',
    findWallet: async () => ({ valid: true, wallet: mockWallet }),
    findCosigners: async () => [mockCosigner],
    countPendingTransactions: async () => ({ valid: true, pendingTxs: 0 }),
    joinWallet: async () => true,
    createTransaction: async () => ({ valid: true, wallet: mockTransaction }),
    isCosigner: async () => false
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
      const result = await walletService.getWalletState('someId');
      expect(result.valid).toBeTruthy();
      expect(result.wallet!.initiator).toBe(mockCosigner.pubKey);
      expect(result.wallet!.walletId).toBe('someId');
      expect(result.wallet!.walletState).toBe('WaitingForCosigners');
    });

    it('Join Wallet returns wallet state', async () => {
      const m = 2;
      const n = 3;
      expect(await walletService.createWallet('someName', m, n, mockCosigner)).toBe('someId');
      const result: JoinWalletResult = await walletService.joinWallet('someId', defaultCosigner);
      expect(result.success).toBeTruthy();
      expect(result.walletState).toBe('WaitingForCosigners');
    });
  });
});
