# Use Node.js LTS (Long Term Support) as base image
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source files
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript code
RUN npm run build

# Create production image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install only production dependencies and clean cache to reduce image size
RUN npm ci --only=production && npm cache clean --force

# Copy built files from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Create a non-root user and switch to it
# Also create the directory for Cloud SQL Unix socket
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs && \
    mkdir -p /cloudsql && \
    chmod 777 /cloudsql

USER nodeuser

# Expose the port the app runs on
EXPOSE 3000

# Define environment variables
ENV NODE_ENV=production

# Add database initialization script
COPY --from=builder /usr/src/app/dist/models/db-init.js ./dist/models/

# Health check - using curl instead of wget for smaller image footprint
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/highscores', (res) => res.statusCode === 200 ? process.exit(0) : process.exit(1))" || exit 1

# Start the application
CMD ["node", "dist/index.js"]
