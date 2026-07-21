FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY scripts/serve-dist.mjs ./scripts/serve-dist.mjs

ENV NODE_ENV=production

CMD ["node", "scripts/serve-dist.mjs"]
