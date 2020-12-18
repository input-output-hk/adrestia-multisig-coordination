# Multisig Coordination Server

A Node.js web service querying the postgres database

## Develop

### Requirements

- `node@v14.5.0`
- `yarn@1.22.4`
- `docker`
- `docker-compose`

There must be a `.env` or `.env.test` file in the root directory with the following configs:

```
# App port
PORT=8080
# Application log level [ trace | debug | info | warn | error | fatal ]
LOGGER_LEVEL="debug"
# App address to bind to
BIND_ADDRESS=0.0.0.0
# PostgresDB connection string
DB_CONNECTION_STRING="postgresql://postgres:mysecretpassword@127.0.0.1:5432/test"
```

### Install packages from offline cache
The offline cache enables reproducible builds.
```
yarn --offline
```

### Run tests
```
yarn test
```

### Start the Service
```
yarn services:up
```
### Stop the Service
```
yarn services:down
```

### Or Start a Local Instance without using Docker

```
yarn dev
```
Note: PostgreSQL instance should be available on localhost and corresponding port.
### Configure MCS Spec Types

[MCS openapi spec](./src/server/openApi.json) file is used to:

- Generate Typescript types to be used in the app: `yarn generate-types`
- To generate validation schemas that are used by Fastify to improve JSON rendering. For further details see [Fastify Documentation](https://www.fastify.io/docs/v2.10.x/Validation-and-Serialization/#serialization).