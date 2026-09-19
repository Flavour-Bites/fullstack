FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .
RUN npx prisma generate
# Backend-only image: builds just the Express server bundle. The frontend is a
# separate service hosted on Vercel and is NOT built or served here.
RUN npm run build:server

FROM node:22-alpine AS runner
WORKDIR /app

COPY --from=builder /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/docker-entrypoint.sh ./docker-entrypoint.sh

RUN sed -i 's/\r$//' docker-entrypoint.sh && chmod +x docker-entrypoint.sh && chown -R node:node /app

USER node

EXPOSE 3000

ENV NODE_ENV=production
ENTRYPOINT ["/bin/sh", "/app/docker-entrypoint.sh"]
