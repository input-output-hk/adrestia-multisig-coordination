declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: number;
    BIND_ADDRESS?: string;
    DB_CONNECTION_STRING: string;
    LOGGER_LEVEL: string;
    LOGGER_ENABLED?: string;
    CRON_EXPRESSION: string;
    PRUNING_TIME: number;
    ENABLE_SYNC: boolean;
    MESSAGE_SIZE: number;
  }
}
