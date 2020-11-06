import envalid, { host, num, str } from 'envalid';
/* eslint-disable no-console */

export interface Environment {
  PORT: number;
  BIND_ADDRESS: string;
  DB_CONNECTION_STRING: string;
  LOGGER_LEVEL: string;
}

export const parseEnvironment = (): Environment => {
  const environment = envalid.cleanEnv(process.env, {
    PORT: num(),
    BIND_ADDRESS: host(),
    DB_CONNECTION_STRING: str(),
    LOGGER_LEVEL: str()
  });

  return { ...environment };
};
