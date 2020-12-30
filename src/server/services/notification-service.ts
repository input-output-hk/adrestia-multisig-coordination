import * as http from 'http';
import { Server, Socket } from 'socket.io';
import { WalletRepository } from '../db/wallet-repository';
import Wallet from '../model/wallet';
interface JoinMessage {
  pubKey: string;
}
export interface WalletSubscription {
  message: string;
  wallets: string[];
}
export type JoinResponse = 'No wallets to subscribe' | 'Couldn`t find cosigner with given PubKey' | WalletSubscription;
export interface NewProposalNotification {
  walletId: string;
  transaction: Components.Schemas.Transaction;
}

type SocketMessage = 'join_message' | 'new_proposal';
type MessageTypes = JoinResponse | NewProposalNotification;

type SocketActionFn<T> = (socket: Socket) => (message: T) => void;

interface WrappedServerSocket<T> {
  event: string;
  callback: SocketActionFn<T>;
}

export class NotificationService {
  private io: Server;
  private walletRepository: WalletRepository;

  constructor(httpServer: http.Server, walletRepository: WalletRepository) {
    this.walletRepository = walletRepository;
    this.io = new Server(httpServer, { path: '/notifications' });
    this.io.on('connection', async (socket: Socket) => {
      this.registerEvents().forEach(({ event, callback }) => {
        socket.on(event, callback(socket));
      });
    });
  }

  private createSocket<T>(event: SocketMessage, callback: SocketActionFn<T>): WrappedServerSocket<T> {
    return { event, callback };
  }

  private emit(to: Server | Socket, event: SocketMessage, data: MessageTypes) {
    to.emit(event, data);
  }

  private registerEvents() {
    const joinMessageEvent = this.createSocket<JoinMessage>('join_message', socket => async joinMessage => {
      const pubKey = joinMessage.pubKey;
      const cosigner = await this.walletRepository.findCosigner(pubKey);
      if (!cosigner) {
        this.emit(socket, 'join_message', 'Couldn`t find cosigner with given PubKey');
        return;
      }

      const subscribedTo: string[] = this.subscribeTo(socket, await cosigner.getWallets());
      this.emit(socket, 'join_message', this.resolveMessage(subscribedTo));
    });
    return [joinMessageEvent];
  }

  private subscribeTo(socket: Socket, wallets: Wallet[]): string[] {
    return wallets.map(wallet => {
      socket.join(`wallets:${wallet.id}`);
      return wallet.id;
    });
  }

  private resolveMessage(subscribedWallets: string[]): JoinResponse {
    if (subscribedWallets.length === 0) {
      return 'No wallets to subscribe';
    }
    return {
      message: 'Will receive notifications from subscribed wallets',
      wallets: subscribedWallets
    };
  }

  public async notifyNewProposal(walletId: string, transaction: Components.Schemas.Transaction): Promise<void> {
    this.emit(this.io.to(`wallets:${walletId}`), 'new_proposal', { walletId, transaction });
  }
}

const configure = (httpServer: http.Server, walletRepository: WalletRepository): NotificationService =>
  new NotificationService(httpServer, walletRepository);

export default configure;
