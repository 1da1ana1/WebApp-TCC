# ──────────────────────────────────────────────────────────────────────────
# API NestJS — build multi-stage.
#   Stage 1 (builder): instala TODAS as deps, gera o Prisma Client e compila o
#                      TypeScript (nest build → dist/).
#   Stage 2 (runner):  imagem enxuta que roda apenas o JS final + as migrations.
# ──────────────────────────────────────────────────────────────────────────

# ---- Stage 1: builder ----
FROM node:20-alpine AS builder
WORKDIR /app

# Cache de dependências: copia só os manifests antes do código-fonte.
COPY package*.json ./
RUN npm ci

# Gera o Prisma Client (precisa do schema antes do restante do código).
COPY prisma ./prisma
RUN npx prisma generate

# Compila o projeto.
COPY . .
RUN npm run build

# ---- Stage 2: runner ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# openssl é exigido pelos engines do Prisma no Alpine (musl).
RUN apk add --no-cache openssl

# Traz node_modules já com o Prisma Client gerado e a CLI do Prisma (usada pelo
# `migrate deploy` no start). Mantemos o node_modules do builder para garantir
# que a CLI e seus engines estejam presentes e consistentes.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

EXPOSE 3000

# Aplica as migrations (baseline + futuras) e sobe a API.
# `migrate deploy` é idempotente e seguro para produção (nunca dá reset).
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
