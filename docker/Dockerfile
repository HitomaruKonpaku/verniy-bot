# BASE
FROM node:lts-alpine AS base

RUN apk add --no-cache tini

WORKDIR /app

COPY package*.json ./

# DEPENDENCIES
FROM base AS dependencies

RUN npm ci --omit=dev

# BUILDER
FROM base AS builder

RUN npm ci

COPY . .

RUN npm run build

# RELEASE
FROM base AS release

ENV NODE_ENV=production

VOLUME /app/logs
VOLUME /app/data

RUN apk add --no-cache bash

COPY docker/docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder      /app/dist ./dist

ENTRYPOINT [ "/sbin/tini", "--", "/bin/sh", "/docker-entrypoint.sh" ]
