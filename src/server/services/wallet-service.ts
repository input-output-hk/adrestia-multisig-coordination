import { WalletRepository } from '../db/wallet-repository';
import { CoSigner, WalletId, WalletState } from '../models';
import { v4 as uuidv4 } from 'uuid';
import { toTransactionResponse, toWalletResponse } from '../utils/data-mapper';
import { ErrorFactory } from '../utils/errors';
import Wallet from '../model/wallet';
import Cosigner from '../model/cosigner';
import Transaction from '../model/transaction';

export class WalletService {
  private repository: WalletRepository;

  constructor(repository: WalletRepository) {
    this.repository = repository;
  }

  private async findWallet(walletId: string): Promise<Wallet> {
    const wallet = await this.repository.findWallet(walletId);
    if (!wallet) {
      throw ErrorFactory.walletNotFound;
    }
    return wallet;
  }

  private async findCosigner(pubKey: string): Promise<Cosigner> {
    const cosigner = await this.repository.findCosigner(pubKey);
    if (!cosigner) {
      throw ErrorFactory.cosignerNotFound;
    }
    return cosigner;
  }

  private async findTransaction(transactionId: string): Promise<Transaction> {
    const transaction = await this.repository.findTransaction(transactionId);
    if (!transaction) {
      throw ErrorFactory.transactionNotFound;
    }
    return transaction;
  }

  private async getWalletState(wallet: Wallet) {
    const requiredCosigners = wallet.n;
    const countCosigners = await wallet.countCosigners();
    if (countCosigners >= requiredCosigners) {
      return 'Ready';
    }
    if (this.hasExpired(wallet)) {
      return 'Expired';
    }
    return 'WaitingForCosigners';
  }

  private getTransactionState = async (transaction: Transaction, requiredSignatures: number) =>
    (await transaction.countSignatures()) >= requiredSignatures ? 'Signed' : 'WaitingForSignatures';

  private async countPendingTransactions(wallet: Wallet) {
    const transactions: Transaction[] = await wallet.getTransactions();
    const pendingTransactions = transactions.filter(
      async transaction => (await transaction.countSignatures()) >= wallet.m
    );
    return pendingTransactions.length;
  }

  private hasExpired = (wallet: Wallet) => false; // todo implement

  async createWallet(walletName: string, m: number, n: number, cosigner: CoSigner): Promise<WalletId> {
    const id = uuidv4();
    const initiator = await this.repository.addCosigner(cosigner);
    const wallet = await initiator.createWallet({ id, name: walletName, m, n });
    await wallet.setInitiator(initiator);
    await wallet.addCosigner(initiator);
    await initiator.addWallet(wallet);
    return wallet.id;
  }

  async getWallet(walletId: string): Promise<Components.Schemas.Wallet> {
    const wallet = await this.findWallet(walletId);

    const cosigners: Components.Schemas.CoSigner[] = (await wallet.getCosigners()).map(cosigner => ({
      pubKey: cosigner.pubKey,
      cosignerAlias: cosigner.alias
    }));
    const walletState: WalletState = await this.getWalletState(wallet);
    const pendingTxs = await this.countPendingTransactions(wallet);
    const initiator = await wallet.getInitiator();
    return toWalletResponse(wallet, walletState, pendingTxs, initiator.pubKey, cosigners);
  }

  async joinWallet(walletId: string, joiningCosigner: CoSigner): Promise<WalletState> {
    const wallet = await this.findWallet(walletId);

    const cosigner = await this.repository.addCosigner(joiningCosigner);
    const cosigners = await wallet.getCosigners();
    if (await wallet.hasCosigner(cosigner.pubKey)) {
      throw ErrorFactory.alreadyJoined;
    }
    if (cosigners.length >= wallet.n) {
      throw ErrorFactory.walletIsFull;
    }
    await cosigner.addWallet(wallet);
    await wallet.addCosigner(cosigner);
    return await this.getWalletState(wallet);
  }

  async getTransactions(walletId: string, from?: string, pending?: boolean): Promise<Components.Schemas.Transaction[]> {
    const wallet = await this.findWallet(walletId);

    const requiredSignatures = wallet.m;
    const walletTransactions = await wallet.getTransactions();
    let transactions = await Promise.all(
      walletTransactions.map(async transaction => {
        const transactionState = await this.getTransactionState(transaction, requiredSignatures);
        return toTransactionResponse(transaction, transactionState);
      })
    );
    if (pending) {
      transactions = transactions.filter(transaction => transaction.transactionState === 'WaitingForSignatures');
    }
    return transactions;
  }
  async newTransactionProposal(
    walletId: string,
    transactionProposal: Components.RequestBodies.TransactionProposal
  ): Promise<Components.Schemas.Transaction> {
    const wallet = await this.findWallet(walletId);

    if (!(await wallet.hasCosigner(transactionProposal.issuer))) {
      throw ErrorFactory.invalidCosigner;
    }
    const cosigner = await this.findCosigner(transactionProposal.issuer);

    const transactionId = uuidv4();
    const transaction = await wallet.createTransaction({
      id: transactionId,
      unsignedTransaction: transactionProposal.tx
    });
    transaction.setIssuer(cosigner);
    transaction.setWallet(wallet);
    const signature = await transaction.createSignature({
      id: uuidv4()
    });
    signature.setCosigner(cosigner);
    signature.setTransaction(transaction);
    transaction.addSignature(signature);
    const transactionState = await this.getTransactionState(transaction, wallet.m);
    return toTransactionResponse(transaction, transactionState);
  }

  async signTransaction(transactionId: string, issuer: string): Promise<Components.Schemas.Transaction> {
    const cosigner = await this.findCosigner(issuer);
    const transaction = await this.findTransaction(transactionId);
    const transactionWallet = await transaction.getWallet();
    const transactionState = await this.getTransactionState(transaction, transactionWallet.m);
    if (transactionState === 'Signed') {
      throw ErrorFactory.alreadySigned;
    }
    const isCosigner = await transactionWallet.hasCosigner(cosigner.pubKey);
    if (!isCosigner) {
      throw ErrorFactory.invalidCosigner;
    }
    const signatures = await transaction.getSignatures();
    const signatureIssuers = await Promise.all(
      signatures.map(async signature => (await signature.getCosigner()).pubKey)
    );
    if (signatureIssuers.includes(issuer)) {
      throw ErrorFactory.alreadySignedBy;
    }

    const signature = await transaction.createSignature({ id: uuidv4() });
    signature.setCosigner(cosigner);
    signature.setTransaction(transaction);
    transaction.addSignature(signature);

    const newState = await this.getTransactionState(transaction, transactionWallet.m);
    return toTransactionResponse(transaction, newState);
  }
}

const configure = (repository: WalletRepository): WalletService => new WalletService(repository);

export default configure;
