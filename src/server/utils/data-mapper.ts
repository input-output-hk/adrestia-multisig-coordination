import { QueryResultRow } from 'pg';
import { Wallet } from '../models';
/* eslint-disable camelcase */

export const mapToWalletCreationResponse = (result: string): Components.Responses.CreateWallet => ({
  walletId: result
});

export const mapToWallet = (result: QueryResultRow): Wallet => {
  const { id, wallet_name, n, m, create_date, initiator } = result;
  return {
    walletId: id,
    walletName: wallet_name,
    n,
    m,
    createDate: create_date,
    initiator
  };
};
