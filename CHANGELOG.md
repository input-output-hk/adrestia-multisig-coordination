# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.1.0](https://github.com/input-output-hk/multisig-coordination-server/compare/v0.0.2...v0.1.0) (2021-01-12)


### Features

* add db cleaning mechanism and script to schedule it ([1312422](https://github.com/input-output-hk/multisig-coordination-server/commit/1312422259c7058621cbdaadfb5c46cf20ce7aa6))


### Bug Fixes

* use ISO format in transaction responses and add time to 'from' parameter in order to make pagination posible ([9ceb61e](https://github.com/input-output-hk/multisig-coordination-server/commit/9ceb61ebc0464df0e18dcc6cecb0c3fbf4a903fa))

### [0.0.2](https://github.com/input-output-hk/multisig-coordination-server/compare/v0.0.1...v0.0.2) (2021-01-05)


### Features

* add notification service ([51331a8](https://github.com/input-output-hk/multisig-coordination-server/commit/51331a84f74d3321030ff36904747cf8f7883216))


### Bug Fixes

* automatically subscribe sockets to new wallet notifications once identified with pubKey ([dd06d66](https://github.com/input-output-hk/multisig-coordination-server/commit/dd06d6611186a2639bcdcbcf7116cfd414dee034))
* some input validations ([4bbd98d](https://github.com/input-output-hk/multisig-coordination-server/commit/4bbd98d9d9ae9feb01dfb19e814014db41d1abb8))

### 0.0.1 (2021-12-18)


### Features

* add join wallet endpoint ([7841347](https://github.com/input-output-hk/multisig-coordination-server/commit/7841347c7c63b0f3010297d9d6f0b76ee55fa095))
* add OAS (json) and generate types ([0a3faf6](https://github.com/input-output-hk/multisig-coordination-server/commit/0a3faf6455c0bb4d8f246383af7e8f2abef4a182))
* add query wallet state endpoint ([c63c31a](https://github.com/input-output-hk/multisig-coordination-server/commit/c63c31ac80f1ca811c41cb4841e893354ca53691))
* add transaction proposal endpoint ([f11e14d](https://github.com/input-output-hk/multisig-coordination-server/commit/f11e14d56ea54daa244308392dd9e761bda1a2d9))
* fastify metrics ([f4b1432](https://github.com/input-output-hk/multisig-coordination-server/commit/f4b14325a1c48d3d8e31b207fb51f25242cc02cd))
* wallet creation endpoint with db insertion ([9fe50c7](https://github.com/input-output-hk/multisig-coordination-server/commit/9fe50c716052ea31fc21362047c062c645beba5d))


### Bug Fixes

* added types uuid to packages-cache ([27c5b93](https://github.com/input-output-hk/multisig-coordination-server/commit/27c5b938f0b477925ea499aeac9b17a91de6130b))
* force db to drop tables on initialization (correct behaviour TBD) ([17638a0](https://github.com/input-output-hk/multisig-coordination-server/commit/17638a0fe2affc34a28f09e1cfcade7edfe90808))
* get transactions endpoint based on query params ([0696ea8](https://github.com/input-output-hk/multisig-coordination-server/commit/0696ea8248ab15f1acf81c2bf0b6759a5aa5c191))
* wrong uuid v4 import ([1ba7354](https://github.com/input-output-hk/multisig-coordination-server/commit/1ba7354f9564dee92184274bfef378696082771a))
* **deps:** remove caret and move @types/uuid to devDependencies ([d6a46e3](https://github.com/input-output-hk/multisig-coordination-server/commit/d6a46e3dcae2cb6bfe5cf90e2fbfe8ed4527f79e))

* **tests:** db tables creation synched with tests setup ([759d4bd](https://github.com/input-output-hk/multisig-coordination-server/commit/759d4bda57edb9e157558122b561066194f9b780))
---
