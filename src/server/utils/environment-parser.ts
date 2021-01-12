import envalid, { bool, host, num, str } from 'envalid';
/* eslint-disable no-console */

export interface Environment {
  PORT: number;
  BIND_ADDRESS: string;
  DB_CONNECTION_STRING: string;
  LOGGER_LEVEL: string;
  PAGE_SIZE: number;
  CRON_EXPRESSION: string;
  EXPIRATION_TIME: number;
  PRUNING_TIME: number;
  ENABLE_SYNC: boolean;
}

export const parseEnvironment = (): Environment => {
  const environment = envalid.cleanEnv(process.env, {
    PORT: num(),
    BIND_ADDRESS: host(),
    DB_CONNECTION_STRING: str(),
    LOGGER_LEVEL: str(),
    PAGE_SIZE: num(),
    CRON_EXPRESSION: str(),
    EXPIRATION_TIME: num(),
    PRUNING_TIME: num(),
    ENABLE_SYNC: bool({ default: false })
  });

  return { ...environment };
};
