# Stage 1: Build the application
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./

# Install only production dependencies
# Alpine requires some build tools to compile native modules like sqlite3
RUN apk add --no-cache python3 make g++ && \
    npm ci --only=production && \
    apk del python3 make g++

# Copy compiled backend and built static assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js

# Environment and volumes configuration
EXPOSE 3001
ENV PORT=3001
ENV DATABASE_PATH=/data/database.db

# Create persistent data directory
RUN mkdir -p /data

CMD ["node", "server.js"]
