# Etapa 1: build de Nest
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: prod
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

# Debe coincidir con PUERTO_SERVIDOR
EXPOSE 3550

CMD ["node", "dist/main.js"]
