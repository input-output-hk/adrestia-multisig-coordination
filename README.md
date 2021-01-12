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
DB_CONNECTION_STRING="postgresql://postgres:mysecretpassword@127.0.0.1:5432/postgres"
# Page Size
PAGE_SIZE=25
# Cron Time
CRON_EXPRESSION="0 0 * * *" # Daily
# Expiration Time for transactions and wallets (in minutes)
EXPIRATION_TIME=2
# Pruning Time for transactions and wallets (in minutes)
PRUNING_TIME=2
# Sync DB
ENABLE_SYNC="false"
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

### Schedule Data Pruning

Schedules data pruning tasks based on CRON_EXPRESSION env. variable

```
yarn prune-db
```

### DB Migrations

To execute database migrations use:

```
yarn db-migrate
```

This will use [database.json](.config/database.json) to determine which environment to migrate.

Otherwise you can specify instance url:

```
yarn db-migrate --url postgres://postgres:mysecretpassword@127.0.0.1:5432/test
```

Note that url scheme is postgres, not potgresql in this case

### Configure MCS Spec Types

[MCS openapi spec](./src/server/openApi.json) file is used to:

- Generate Typescript types to be used in the app: `yarn generate-types`
- To generate validation schemas that are used by Fastify to improve JSON rendering. For further details see [Fastify Documentation](https://www.fastify.io/docs/v2.10.x/Validation-and-Serialization/#serialization).

# Web Sockets

Socket IO v3 is used to implement the notification service.

In order to connect a client to the MCS via WebSockets, you must consider the following:

- Be aware of [Socket IO protocol](https://github.com/socketio/socket.io-protocol)
- In case of using Socket IO, you must use v3. Due to several breaking changes, a v2 client will not be able to connect to a v3 server.
- By default, the client will try to establish a WebSocket connection, and fall back to XHR/JSONP polling.

## Socket IO Client

### Client initialization

To initialize client and connect you must provide:

- URL (MCS)
- Path: `/notifications`

Default options should be enough to connect but consider `forceNew` option for troubleshooting

### Client registration

To register to MCS notifications you should emit a `join_message` event with your pubKey

> client.emit('join_message', {"pubKey": 'your pubKey here'})

You will receive a response `join_message` event with your subscribed wallets and corresponding events like `new_proposal` for new transaction proposals, so you should listen to those events:

> client.on('join_message', (event) => {...})

- `join_message` response will include a message and the corresponding wallets (IDs)

> client.on('new_proposal', (event) => {...})

- `new_proposal` events will include the walletId and the transaction

## WebSockets Client

In case you are not using Socket IO client, be aware of [Socket IO protocol](https://github.com/socketio/socket.io-protocol) to understand how to send/receive events and keep connection alive.

### Keep Connection Alive

On connection you will receive a message like this:

> 0{"sid":"WPp-hx2iUUYvXicCAAAu","upgrades":[],"pingInterval":25000,"pingTimeout":5000}

To keep connection alive, you must respond to ping event/message before ping timeout (which you received on connection) with a pong event/message.

- Ping event is "2"
- Pong event is "3"

### Send or receive messages

Message/Event format is:

> 42["eventName", data]

So, for subscribing to MCS you should send a message like:

> '42["join_message",{"pubKey": pubKey}]'

And you will receive messages like:

> '42["join_message",{"message":"Subscribed to wallets","wallets":["c7e88e9e-d1e1-4417-80c8-b828fb444699"]}]'
