import * as http from 'http';
import { Server, Socket } from 'socket.io';
import { WalletRepository } from '../db/wallet-repository';
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
      socket.join(`pubKeys:${pubKey}`);
      const wallets = (await cosigner.getWallets()).map(wallet => wallet.id);
      this.subscribeTo(socket, wallets);
    });
    return [joinMessageEvent];
  }

  public notifyNewProposal(walletId: string, transaction: Components.Schemas.Transaction): void {
    this.emit(this.io.to(`wallets:${walletId}`), 'new_proposal', { walletId, transaction });
  }

  /**
   * Find any socket connected and subscribed with pubKey and update subscription with new wallet
   *
   * @param pubKey used to find sockets
   * @param walletId to subscribe
   */
  public async subscribeCosigner(pubKey: string, walletId: string): Promise<void> {
    const sockets = await this.findSocketsFor(pubKey);
    sockets.forEach(socket => this.subscribeTo(socket, [walletId]));
  }

  private async findSocketsFor(pubKey: string): Promise<Socket[]> {
    const room = new Set([`pubKeys:${pubKey}`]);
    const socketIds = await this.io.sockets.adapter.sockets(room);
    return [...socketIds]
      .map(socketId => this.io.sockets.sockets.get(socketId))
      .filter((s): s is Socket => s !== undefined);
  }

  private subscribeTo(socket: Socket, wallets: string[]): void {
    wallets.forEach(walletId => socket.join(`wallets:${walletId}`));
    this.emit(socket, 'join_message', this.resolveMessage(wallets));
  }

  private resolveMessage(subscribedWallets: string[]): JoinResponse {
    if (subscribedWallets.length === 0) {
      return 'No wallets to subscribe';
    }
    return {
      message: 'Subscribed to wallets',
      wallets: subscribedWallets
    };
  }
}

const configure = (httpServer: http.Server, walletRepository: WalletRepository): NotificationService =>
  new NotificationService(httpServer, walletRepository);

export default configure;
