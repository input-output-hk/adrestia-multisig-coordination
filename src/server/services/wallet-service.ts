import { WalletRepository } from '../db/wallet-repository';
import { CoSigner, WalletId, WalletState } from '../models';
import { v4 as uuidv4 } from 'uuid';
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
    return await (await this.findWallet(walletId)).toDTO();
  }

  async joinWallet(walletId: string, joiningCosigner: CoSigner): Promise<WalletState> {
    const wallet = await this.findWallet(walletId);

    const cosigner = await this.repository.addCosigner(joiningCosigner);
    const cosigners = wallet.cosigners;
    if (cosigners.find(walletCosigner => walletCosigner.pubKey === cosigner.pubKey)) {
      throw ErrorFactory.alreadyJoined;
    }
    if (cosigners.length >= wallet.n) {
      throw ErrorFactory.walletIsFull;
    }
    await cosigner.addWallet(wallet);
    await wallet.addCosigner(cosigner);
    return await wallet.getState();
  }

  async getTransactions(
    walletId: string,
    from?: string,
    pending?: boolean,
    cosigner?: string
  ): Promise<Components.Schemas.Transaction[]> {
    const walletTransactions = await this.repository.findTransactions(walletId, from, pending, cosigner);
    return await Promise.all(walletTransactions.map(async transaction => await transaction.toDTO()));
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
    return await transaction.toDTO();
  }

  async signTransaction(transactionId: string, issuer: string): Promise<Components.Schemas.Transaction> {
    const cosigner = await this.findCosigner(issuer);
    const transaction = await this.findTransaction(transactionId);
    const transactionWallet = transaction.wallet;
    const transactionState = await transaction.getState();
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

    return await transaction.toDTO();
  }
}

const configure = (repository: WalletRepository): WalletService => new WalletService(repository);

export default configure;
