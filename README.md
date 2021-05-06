# Overview

Multisig Coordination Server is a service to publish/subscribe to channels where messages are stored and helps to coordinate multisignatures.

This project provides an HTTP API and a Websockets API.

## Getting Started

- Clone this project
- Run `docker-compose up`

The server is up-and-running, you can now publish or query for messages e.g.:

`curl http://localhost:8080/messages/{channelId}`

See also [API Documentation](https://input-output-hk.github.io/adrestia-multisig-coordination/api/edge/).

You may subscribe to channels using websockets, see [Wiki - WebSockets](../../wiki/WebSockets).

## How to build from sources

See [Wiki - Building](../../wiki/Building).

## How to test

See [Wiki - Testing](../../wiki/Testing).

## Documentation

| Link                                                                                           | Audience                                                     |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| [API Documentation](https://input-output-hk.github.io/adrestia-multisig-coordination/api/edge) | Users of the Multisig Coordination HTTP API                  |
| [Wiki](../../wiki)                                                                             | Anyone interested in the project and our development process |
| [WebSockets Manual](../../wiki/WebSockets)                                                     | Users of the Multisig Coordination WebSockets API            |
