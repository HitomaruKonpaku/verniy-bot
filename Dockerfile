# Building

FROM node:20-alpine AS base

WORKDIR /app/

COPY . /app/

RUN npm ci
RUN npm run build

# Deploy

FROM node:20-alpine

ENV NODE_ENV=production

WORKDIR /app/

COPY --from=base /app/dist ./dist
COPY --from=base /app/package.json .
COPY --from=base /app/package-lock.json .

RUN npm ci

RUN npm run deploy-commands

CMD ["npm", "start"]
