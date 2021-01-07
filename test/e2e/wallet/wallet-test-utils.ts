import { FastifyInstance, HTTPInjectResponse } from 'fastify';
import StatusCodes from 'http-status-codes';
import moment from 'moment';
import { Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { CoSigner, TransactionId, WalletId } from '../../../src/server/models';
import { setCreatedAt } from '../utils/test-utils';

export const defaultCosigner: CoSigner = {
  cosignerAlias: 'someAlias',
  pubKey: 'someKey'
};

export const defaultWallet: Components.RequestBodies.CreateWallet = {
  walletName: 'someName',
  m: 2,
  n: 3,
  cosigner: defaultCosigner
};

export const defaultTransactionProposal: Components.RequestBodies.TransactionProposal = {
  tx: 'someTransaction',
  issuer: defaultCosigner.pubKey
};

export const defaultSignProposal: Components.RequestBodies.SignProposal = {
  issuer: defaultCosigner.pubKey
};

export const createCosigner = (alias: string): CoSigner => ({
  cosignerAlias: alias,
  pubKey: uuidv4()
});

export const createWallet = async (
  server: FastifyInstance,
  request: Components.RequestBodies.CreateWallet = defaultWallet
): Promise<HTTPInjectResponse> =>
  await server.inject({
    method: 'post',
    url: '/wallets',
    payload: request
  });

export const joinWallet = async (
  server: FastifyInstance,
  walletId: string,
  request: Components.RequestBodies.JoinWallet = defaultCosigner
): Promise<HTTPInjectResponse> =>
  await server.inject({
    method: 'post',
    url: `/wallets/${walletId}/join`,
    payload: request
  });

export const newTransactionProposal = async (
  server: FastifyInstance,
  walletId: string,
  request: Components.RequestBodies.TransactionProposal = defaultTransactionProposal
): Promise<HTTPInjectResponse> =>
  await server.inject({
    method: 'post',
    url: `/wallets/${walletId}/proposal`,
    payload: request
  });

export const signTransaction = async (
  server: FastifyInstance,
  transactionId: string,
  request: Components.RequestBodies.SignProposal = defaultSignProposal
): Promise<HTTPInjectResponse> =>
  await server.inject({
    method: 'post',
    url: `/transactions/${transactionId}/sign`,
    payload: request
  });

export const getTransactionProposals = async (
  server: FastifyInstance,
  walletId: string,
  from?: string,
  onlyPending?: boolean,
  cosigner?: string
): Promise<HTTPInjectResponse> => {
  let queryParameters = '';
  if (from || onlyPending || cosigner) {
    queryParameters += '?';
  }
  queryParameters += from ? `from=${from}&` : '';
  queryParameters += onlyPending ? `onlyPending=${onlyPending}&` : '';
  queryParameters += cosigner ? `cosigner=${cosigner}` : '';
  return await server.inject({
    method: 'get',
    url: `/wallets/${walletId}/proposal${queryParameters}`
  });
};

export const getWallet = async (server: FastifyInstance, walletId: string): Promise<HTTPInjectResponse> =>
  await server.inject({
    method: 'get',
    url: `/wallets/${walletId}`
  });

export const testCreateWallet = async (server: FastifyInstance): Promise<WalletId> => {
  const response = await createWallet(server);

  expect(response.statusCode).toEqual(StatusCodes.OK);
  expect(response.json()).toHaveProperty('walletId');

  return response.json().walletId;
};

export const testCreateReadyWallet = async (server: FastifyInstance): Promise<WalletId> => {
  const response = await createWallet(server);

  expect(response.statusCode).toEqual(StatusCodes.OK);
  expect(response.json()).toHaveProperty('walletId');
  const walletId = response.json().walletId;

  await joinWallet(server, walletId, createCosigner('secondCosigner'));
  await joinWallet(server, walletId, createCosigner('thirdCosigner'));

  return walletId;
};

export const testCreateExpiredWallet = async (
  server: FastifyInstance,
  database: Sequelize,
  expirationTime: number
): Promise<WalletId> => {
  const walletId = await testCreateWallet(server);
  const simulatedDate = moment()
    .subtract(expirationTime, 'minutes')
    .subtract(expirationTime, 'seconds')
    .toDate();
  await setCreatedAt(database, 'wallets', walletId, simulatedDate);
  const expiredWallet = await getWallet(server, walletId);
  expect(expiredWallet.statusCode).toEqual(StatusCodes.OK);
  expect(expiredWallet.json()).toHaveProperty('state');
  expect(expiredWallet.json().state).toBe('Expired');

  return walletId;
};

export const testNewTransaction = async (server: FastifyInstance, walletId: WalletId): Promise<TransactionId> => {
  const response = await newTransactionProposal(server, walletId);
  expect(response.statusCode).toBe(StatusCodes.OK);
  expect(response.json()).toHaveProperty('transactionState');
  expect(response.json().transactionState).toBe('WaitingForSignatures');
  expect(response.json()).toHaveProperty('transactionId');
  return response.json().transactionId;
};
