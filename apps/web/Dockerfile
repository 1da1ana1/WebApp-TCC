# ──────────────────────────────────────────────────────────────────────────
# Front Vue 3 + Vite — build multi-stage.
#   Stage 1 (builder): compila a SPA (vite build → dist/, lê .env.production).
#   Stage 2 (runner):  Nginx servindo os estáticos + proxy /api → backend.
# ──────────────────────────────────────────────────────────────────────────

# ---- Stage 1: builder ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

# .env.production define VITE_API_BASE_URL=/api (mesma origem, via Nginx).
COPY . .
RUN npm run build

# ---- Stage 2: runner (Nginx) ----
FROM nginx:1.27-alpine AS runner

# Config do site: SPA fallback (history mode) + proxy /api → api:3000.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Estáticos compilados.
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

# Sem CMD: o padrão da imagem nginx já é ["nginx", "-g", "daemon off;"].
