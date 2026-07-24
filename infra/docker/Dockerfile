# =============================================================================
# SmartBuild — Next.js Standalone App — Multi-Stage Docker Build
#
# Stages:
#   1. deps        — install only production + dev deps for building
#   2. builder     — run prisma generate + next build
#   3. runner      — minimal image with .next/standalone only
#
# Build:
#   docker build -f infra/docker/Dockerfile -t smartbuild-app:latest .
#
# Run:
#   docker run --env-file .env -p 3000:3000 smartbuild-app:latest
#
# Notes:
#   - Prisma uses SQLite in development (schema.prisma datasource). For
#     production MySQL, set DATABASE_URL=mysql://... and change the
#     provider in a separate migration, or supply it via env at build time
#     for prisma generate (prisma generate does not need the DB online).
#   - The build copies .next/static and public/ into the standalone dir,
#     matching the "build" script in package.json.
# =============================================================================

# --------------------------------------------------------------------------
# Stage 1: deps — install all dependencies (dev + prod)
# --------------------------------------------------------------------------
FROM node:20-alpine AS deps

# Install build tools needed for native bindings (bcryptjs, sharp, etc.)
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy only manifest files first — layer cache is invalidated only when
# these files change, not on every source code change.
COPY package.json package-lock.json* ./
COPY prisma/schema.prisma ./prisma/schema.prisma

# Install all dependencies (including devDeps needed for next build)
RUN npm ci --prefer-offline

# --------------------------------------------------------------------------
# Stage 2: builder — generate Prisma client, then build Next.js
# --------------------------------------------------------------------------
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Re-use node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma       ./prisma

# Copy full source
COPY . .

# Build-time environment variables (non-secret).
# Secrets (DATABASE_URL, JWT_SECRET, etc.) must NOT be baked into the image;
# they are injected at container runtime via --env-file or docker-compose env.
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# NEXT_TELEMETRY_DISABLED=1 — opt out of Next.js anonymous telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# DATABASE_URL is required by Prisma CLI at generate time (not at query time).
# Provide a valid DSN or a dummy file path — the DB does not need to be online.
# Override with: --build-arg DATABASE_URL=file:/tmp/dummy.db
ARG DATABASE_URL=file:/tmp/build.db
ENV DATABASE_URL=${DATABASE_URL}

# 1. Generate Prisma client (bakes query engine into node_modules)
RUN npx prisma generate

# 2. Build Next.js (output: standalone)
RUN npm run build

# Copy static assets into the standalone output directory
# (mirrors the "build" script: cp -r .next/static && cp -r public)
RUN cp -r .next/static  .next/standalone/.next/static && \
    cp -r public        .next/standalone/public

# --------------------------------------------------------------------------
# Stage 3: runner — minimal production image
# --------------------------------------------------------------------------
FROM node:20-alpine AS runner

RUN apk add --no-cache \
    # curl is used by the HEALTHCHECK
    curl \
    # openssl needed by Prisma query engine at runtime
    openssl \
    # dumb-init: proper PID 1 signal handling (SIGTERM propagation)
    dumb-init

WORKDIR /app

# Create a non-root user and group for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Copy the standalone server bundle from the builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public           ./public

# Create upload directory (writable by app) — mount a volume over this
RUN mkdir -p /app/upload && chown nextjs:nodejs /app/upload

# Runtime environment — these are defaults; override via docker-compose env
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Expose the port Next.js listens on
EXPOSE 3000

# Switch to non-root user
USER nextjs

# Health check — Next.js serves a 200 on / when healthy
# Adjust the path to a lightweight endpoint if you have one (e.g. /api/health)
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -fsS http://localhost:3000/api/health || \
        curl -fsS http://localhost:3000/ || \
        exit 1

# Use dumb-init as PID 1 so SIGTERM is forwarded correctly to node
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Run the Next.js standalone server
CMD ["node", "server.js"]
