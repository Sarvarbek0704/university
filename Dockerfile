FROM node:18-alpine

RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    postgresql-client

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./

RUN npm ci --only=production --no-optional

COPY . .

RUN npm run build

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3333

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node health-check.js

CMD ["node", "dist/main.js"]