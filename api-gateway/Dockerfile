# Stage 1: build NestJS application
FROM node:20-alpine AS builder

# Set working directory for the build step
WORKDIR /app

# Install dependencies based on package manifests
COPY package*.json ./
RUN npm install

# Copy the full source code and build the project
COPY . .
RUN npm run build

# Stage 2: production runtime image
FROM node:20-alpine AS runner

# Set working directory for the runtime container
WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled application from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the HTTP port used by the NestJS application
EXPOSE 7077

# Start the NestJS application
CMD ["node", "dist/main.js"]
