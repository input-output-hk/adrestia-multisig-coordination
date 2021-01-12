declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: number;
    BIND_ADDRESS?: string;
    DB_CONNECTION_STRING: string;
    LOGGER_LEVEL: string;
    LOGGER_ENABLED?: string;
    PAGE_SIZE?: number;
    CRON_EXPRESSION: string;
    EXPIRATION_TIME: number;
    PRUNING_TIME: number;
    ENABLE_SYNC: boolean;
  }
}
