# Etapa 1: build de Nest (compilar TypeScript)
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: imagen ligera para producción
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Solo dependencias de producción
COPY package*.json ./
RUN npm install --omit=dev

# Copiamos el build ya transpilado
COPY --from=builder /app/dist ./dist

# Opcional: copiar .env de producción si lo usas así
# COPY .env . 

EXPOSE 8090

CMD ["node", "dist/main.js"]
