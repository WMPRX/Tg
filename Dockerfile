# syntax=docker/dockerfile:1.6

# -----------------------------------------------------------------------------
# TgDir — production image (multi-stage, Next.js standalone + Prisma + Postgres)
# -----------------------------------------------------------------------------
# Build:   docker build -t tgdir .
# Deploy:  Coolify picks up this Dockerfile automatically (rootfs at /app).
# -----------------------------------------------------------------------------

ARG NODE_VERSION=20-alpine

# ---------- 1) deps ---------------------------------------------------------
FROM node:${NODE_VERSION} AS deps
WORKDIR /app

# libc6-compat is required by Prisma/OpenSSL on Alpine.
RUN apk add --no-cache libc6-compat openssl

COPY package.json package-lock.json* ./
# Swap the Postgres schema in BEFORE `npm ci` so the postinstall `prisma
# generate` produces a Postgres-aware client.
COPY prisma/schema.production.prisma ./prisma/schema.prisma

RUN npm ci --no-audit --no-fund

# ---------- 2) builder ------------------------------------------------------
FROM node:${NODE_VERSION} AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache libc6-compat openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Ensure the Postgres schema is in place for both `prisma generate` during
# build and the runtime migrate step.
COPY prisma/schema.production.prisma ./prisma/schema.prisma

# The build step hits `prisma generate` via the package.json script.
RUN npm run build

# ---------- 3) runner -------------------------------------------------------
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apk add --no-cache libc6-compat openssl tini \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Copy the standalone Next.js server + static assets.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Prisma CLI + schema + seed so the container can run `migrate deploy` and
# `db:seed` on boot (used by docker-entrypoint.sh).
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/tsx ./node_modules/tsx
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/bcryptjs ./node_modules/bcryptjs
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --chown=nextjs:nodejs docker/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

ENTRYPOINT ["/sbin/tini", "--", "/usr/local/bin/entrypoint.sh"]
CMD ["node", "server.js"]
