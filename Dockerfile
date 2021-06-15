ARG UBUNTU_VERSION=20.04

FROM ubuntu:${UBUNTU_VERSION} as ubuntu-nodejs
ARG NODEJS_MAJOR_VERSION=14
ENV DEBIAN_FRONTEND=nonintercative
RUN apt-get update && apt-get install curl -y &&\
  curl --proto '=https' --tlsv1.2 -sSf -L https://deb.nodesource.com/setup_${NODEJS_MAJOR_VERSION}.x | bash - &&\
  apt-get install nodejs -y

FROM ubuntu-nodejs as nodejs-builder
RUN curl --proto '=https' --tlsv1.2 -sSf -L https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - &&\
  echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list &&\
  apt-get update && apt-get install gcc g++ make gnupg2 yarn -y

# Copy deps
FROM nodejs-builder as mcs-base
RUN mkdir -p /app/src
WORKDIR /app
COPY  packages-cache /app/packages-cache
COPY  package.json \
      yarn.lock \
      .yarnrc \
      /app/

# Build the app
FROM mcs-base as mcs-builder
COPY  tsconfig-dist.json \
      tsconfig.json \
      /app/
RUN yarn --offline --frozen-lockfile --non-interactive
COPY src /app/src
RUN yarn build

# Install offline prod deps
FROM mcs-base as mcs-production-deps
RUN yarn --offline --frozen-lockfile --non-interactive --production

# Bundle everything on the final image
FROM nodejs-builder as mcs
ARG NETWORK=mainnet
COPY --from=mcs-builder /app/dist /mcs/dist
COPY --from=mcs-builder /app/src/server/api /mcs/dist/src/server/api
COPY --from=mcs-production-deps /app/node_modules /mcs/node_modules
EXPOSE 8080
CMD ["node", "/mcs/dist/src/server/index.js"]
