# base
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

# deps
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# build
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm exec prisma generate
RUN pnpm build

# runtime
FROM node:22-alpine AS runtime
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 sveltekit

COPY --from=build --chown=sveltekit:nodejs /app/build ./build
COPY --from=build --chown=sveltekit:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=sveltekit:nodejs /app/package.json ./package.json

USER sveltekit

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "build"]
