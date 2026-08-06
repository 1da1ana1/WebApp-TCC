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

# Desliga a checagem de versão da CLI do Prisma (evita uma chamada HTTP a cada
# start do container).
ENV CHECKPOINT_DISABLE=1

# Usuário `node` (uid 1000) já existe na imagem oficial. A aplicação apenas lê
# os arquivos copiados, então não é preciso ajustar ownership.
USER node

EXPOSE 3000

# start-period cobre o `migrate deploy`, que roda antes do listen.
HEALTHCHECK --interval=10s --timeout=5s --start-period=40s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3000/ >/dev/null 2>&1 || exit 1

# Aplica as migrations (baseline + futuras) e sobe a API.
# `migrate deploy` é idempotente e seguro para produção (nunca dá reset).
#
# ATENÇÃO ao caminho `dist/src/main.js`: o tsc aninha a saída sob `src/` porque
# o projeto compila arquivos fora de src/ (prisma/, config/, seed.ts) e a raiz
# comum passa a ser a raiz do projeto. O `rootDir: "."` no tsconfig.json fixa
# esse layout — não troque por `dist/main.js`.
#
# Usamos o binário local em vez de `npx` para não depender de resolução via
# rede/cache do npm rodando como usuário não-root.
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/src/main.js"]
