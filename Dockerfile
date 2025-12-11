# Stage 1: Dependencies and Build
FROM node:22-slim AS builder
WORKDIR /app

# Define build arguments
ARG POSTGRES_URL
ARG NODE_ENV
ARG NEXT_PUBLIC_API_URL

# Set environment variables for build
ENV POSTGRES_URL=${POSTGRES_URL}
ENV NODE_ENV=${NODE_ENV}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1
ENV ENVIRONMENT=${ENVIRONMENT:-development}
ENV SKIP_LINT=true
ENV SKIP_TYPE_CHECK=true

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files first to leverage Docker cache
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies)
RUN pnpm install --frozen-lockfile

# Copy application code
COPY . .

# Build the application
RUN pnpm build

# Stage 2: Production runtime
FROM node:20-slim AS runner
WORKDIR /app

# Install production dependencies only
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && \
    corepack prepare pnpm@latest --activate && \
    pnpm install --prod --frozen-lockfile

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose port
EXPOSE 3000

# Set the command to run the application
CMD ["node", "server.js"]
