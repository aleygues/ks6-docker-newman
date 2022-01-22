FROM node:lts-alpine AS dependencies

WORKDIR /app
COPY package.json package.json
COPY yarn.lock yarn.lock
RUN SKIP_POSTINSTALL=1 yarn install

FROM node:lts-alpine AS dev

WORKDIR /app
COPY package.json package.json
COPY tsconfig.json tsconfig.json
COPY --from=dependencies /app/node_modules node_modules
CMD npx keystone postinstall --fix && yarn dev

FROM node:lts-alpine AS prod

WORKDIR /app
COPY package.json package.json
COPY tsconfig.json tsconfig.json
COPY keystone.ts keystone.ts
COPY --from=dependencies /app/node_modules node_modules
COPY src src
CMD npx keystone postinstall --fix && yarn build && npx keystone prisma db push --accept-data-loss && yarn start