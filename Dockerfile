FROM node:18-alpine AS base

WORKDIR /app/

COPY . /app/

RUN npm install
RUN npm run build
RUN npm run deploy-commands

ENV NODE_ENV=production

CMD ["npm", "start"]