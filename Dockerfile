# syntax=docker/dockerfile:1

# ---------- deps: instala dependências ----------
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
# O schema precisa existir antes do npm ci: o postinstall do @prisma/client roda prisma generate
COPY prisma ./prisma
RUN npm ci

# ---------- builder: gera o client Prisma e compila o Next ----------
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variáveis NEXT_PUBLIC_* são embutidas no bundle do cliente: precisam existir no BUILD.
# No Coolify, marque cada uma como "Build Variable" para chegarem aqui como build args.
ARG NEXT_PUBLIC_DEFAULT_LOCALE
ARG NEXT_PUBLIC_AVATAR_GENERATOR_URL
ARG NEXT_PUBLIC_UMAMI_SCRIPT_URL
ARG NEXT_PUBLIC_UMAMI_WEBSITE_ID
ARG NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# Usada se o build pré-renderizar páginas que consultam o banco
ARG DATABASE_URL
# Upload de sourcemaps para o Sentry (opcional; sem o token o build só pula o upload)
ARG SENTRY_AUTH_TOKEN
ARG SENTRY_ORGANIZATION
ARG SENTRY_PROJECT

ENV NEXT_PUBLIC_DEFAULT_LOCALE=$NEXT_PUBLIC_DEFAULT_LOCALE \
    NEXT_PUBLIC_AVATAR_GENERATOR_URL=$NEXT_PUBLIC_AVATAR_GENERATOR_URL \
    NEXT_PUBLIC_UMAMI_SCRIPT_URL=$NEXT_PUBLIC_UMAMI_SCRIPT_URL \
    NEXT_PUBLIC_UMAMI_WEBSITE_ID=$NEXT_PUBLIC_UMAMI_WEBSITE_ID \
    NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL=$NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL \
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY \
    DATABASE_URL=$DATABASE_URL \
    SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN \
    SENTRY_ORGANIZATION=$SENTRY_ORGANIZATION \
    SENTRY_PROJECT=$SENTRY_PROJECT \
    NEXT_TELEMETRY_DISABLED=1

RUN npx prisma generate
RUN npm run build

# ---------- runner: imagem final enxuta ----------
FROM node:22-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# CLI do Prisma + migrations para rodar `migrate deploy` no start
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.bin ./node_modules/.bin

EXPOSE 3000

CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node server.js"]
