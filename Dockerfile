# 1. Base Image
FROM public.ecr.aws/docker/library/node:20-alpine AS base
# Install OpenSSL for Prisma and curl for debugging
RUN apk add --no-cache openssl curl

# 2. Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 3. Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# 4. Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create users
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/bot ./bot
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/lib ./lib

# Copy built Next.js assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Install production dependencies only (for bot runner mainly if needed, 
# but next/standalone handles web. Bot needs tsx and others)
# Actually standalone folder includes node_modules for Next.js. 
# But our Bot is running separately. 
# Simplest approach for this scale: Copy full node_modules from builder or deps?
# Standalone is great for Next, but we have a Bot too.
# Let's copy node_modules to be safe for the "Bot" service which might not use standalone.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Set permissions for Uploads and DB
# We will mount volumes here. Ensure user can write.
# SQLite needs write access to the directory
RUN mkdir -p /app/public/uploads && chown nextjs:nodejs /app/public/uploads
RUN chown nextjs:nodejs /app/prisma

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
