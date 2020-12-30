import * as http from 'http';
import { Sequelize } from 'sequelize/types';
import { io, Socket } from 'socket.io-client';
import * as Repositories from '../../../src/server/db/repositories';
import {
  JoinResponse,
  NewProposalNotification,
  WalletSubscription
} from '../../../src/server/services/notification-service';
import * as Services from '../../../src/server/services/services';
import { WalletService } from '../../../src/server/services/wallet-service';
import { Environment, parseEnvironment } from '../../../src/server/utils/environment-parser';
import { setupDatabase } from '../../e2e/utils/test-utils';
import { createCosigner, defaultCosigner } from '../../e2e/wallet/wallet-test-utils';

let environment: Environment;
let database: Sequelize;
let socket: Socket;
let httpServer: http.Server;
let walletService: WalletService;

beforeAll(async done => {
  environment = parseEnvironment();
  const walletRepository = Repositories.configure(environment, (database = await setupDatabase(false)));
  walletService = Services.configure((httpServer = http.createServer()), walletRepository).walletService;
  httpServer.listen(environment.PORT);
  done();
});

afterAll(async done => {
  await database.close();
  httpServer.close();
  done();
});

beforeEach(done => {
  socket = io(`http://localhost:${environment.PORT}`, {
    path: '/notifications',
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 0,
    forceNew: true
  });
  socket.on('connect', () => {
    done();
  });
});

afterEach(done => {
  if (socket.connected) {
    socket.disconnect();
  }
  done();
});

describe('/notifications endpoint and subscribe to events', () => {
  it('should connect socket', () => {
    expect(socket.connected).toBeTruthy();
  });
  test('unknown users should not subscribe', async done => {
    socket.emit('join_message', { pubKey: 'someUnknownKey' });
    socket.once('join_message', (message: JoinResponse) => {
      expect(message).toBe('Couldn`t find cosigner with given PubKey');
      done();
    });
  });

  test('should subscribe to wallet', async done => {
    const cosigner = createCosigner('someName');
    const requiredSignatures = 2;
    const requiredCosigners = 3;
    const walletId = await walletService.createWallet('someWallet', requiredSignatures, requiredCosigners, cosigner);

    socket.emit('join_message', { pubKey: cosigner.pubKey });
    socket.once('join_message', (message: WalletSubscription) => {
      expect(message.wallets).toContain(walletId);
      done();
    });
  });

  test('should subscribe to multiple wallets', async done => {
    const cosigner = createCosigner('someName');
    const requiredSignatures = 2;
    const requiredCosigners = 3;
    const walletId = await walletService.createWallet('someWallet', requiredSignatures, requiredCosigners, cosigner);

    const otherWalletId = await walletService.createWallet(
      'someOtherWallet',
      requiredSignatures,
      requiredCosigners,
      defaultCosigner
    );
    await walletService.joinWallet(otherWalletId, cosigner);

    socket.emit('join_message', { pubKey: cosigner.pubKey });
    socket.once('join_message', (message: WalletSubscription) => {
      expect(message.wallets).toContain(walletId);
      expect(message.wallets).toContain(otherWalletId);
      done();
    });
  });

  test('should receive notifications from subscribed wallet', async done => {
    const cosigner = createCosigner('someName');
    const requiredSignatures = 2;
    const requiredCosigners = 3;
    const walletId = await walletService.createWallet(
      'someWallet',
      requiredSignatures,
      requiredCosigners,
      defaultCosigner
    );

    await walletService.joinWallet(walletId, cosigner);

    socket.emit('join_message', { pubKey: cosigner.pubKey });

    const someTransaction = 'someTransaction';
    socket.once('new_proposal', (message: NewProposalNotification) => {
      expect(message.transaction.unsignedTransaction).toBe(someTransaction);
      done();
    });

    await walletService.newTransactionProposal(walletId, { issuer: defaultCosigner.pubKey, tx: someTransaction });
  });

  test('should receive notifications from subscribed wallets', async done => {
    const cosigner = createCosigner('someName');
    const requiredSignatures = 2;
    const requiredCosigners = 3;
    let firstWalletId;
    let secondWalletId;
    await walletService.joinWallet(
      (firstWalletId = await walletService.createWallet(
        'someWallet',
        requiredSignatures,
        requiredCosigners,
        defaultCosigner
      )),
      cosigner
    );
    await walletService.joinWallet(
      (secondWalletId = await walletService.createWallet(
        'someWallet',
        requiredSignatures,
        requiredCosigners,
        defaultCosigner
      )),
      cosigner
    );

    socket.emit('join_message', { pubKey: cosigner.pubKey });
    let times = 0;
    const messagesToReceive = 2;
    socket.on('new_proposal', (message: NewProposalNotification) => {
      expect(message.transaction).toHaveProperty('transactionId');
      times++;
      if (times === messagesToReceive) {
        done();
      }
    });
    await walletService.newTransactionProposal(firstWalletId, {
      issuer: defaultCosigner.pubKey,
      tx: 'someTransaction'
    });
    await walletService.newTransactionProposal(secondWalletId, {
      issuer: defaultCosigner.pubKey,
      tx: 'someOtherTransaction'
    });
  });
});
