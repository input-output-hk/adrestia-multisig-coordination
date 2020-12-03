import { FastifyInstance, HTTPInjectResponse } from 'fastify';
import { CoSigner, WalletId } from '../../../src/server/models';
import StatusCodes from 'http-status-codes';
import uuid from 'uuid';

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

export const createCosigner = (alias: string): CoSigner => ({
  cosignerAlias: alias,
  pubKey: uuid.v4()
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
