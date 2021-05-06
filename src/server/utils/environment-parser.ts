import envalid, { bool, host, num, str } from 'envalid';
/* eslint-disable no-console */

export interface Environment {
  PORT: number;
  BIND_ADDRESS: string;
  DB_CONNECTION_STRING: string;
  LOGGER_LEVEL: string;
  CRON_EXPRESSION: string;
  PRUNING_TIME: number;
  ENABLE_SYNC: boolean;
  MESSAGE_SIZE: number; // size expressed in kb
}

export const parseEnvironment = (): Environment => {
  const environment = envalid.cleanEnv(process.env, {
    PORT: num(),
    BIND_ADDRESS: host(),
    DB_CONNECTION_STRING: str(),
    LOGGER_LEVEL: str(),
    CRON_EXPRESSION: str(),
    PRUNING_TIME: num(),
    ENABLE_SYNC: bool({ default: false }),
    MESSAGE_SIZE: num()
  });

  return { ...environment };
};
