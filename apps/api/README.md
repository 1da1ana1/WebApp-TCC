# API - Gestao de TCC

Backend da plataforma de gestao de orientacoes de TCC (NestJS + Prisma).

## Requisitos

- Node.js 20+
- npm 10+
- Banco configurado via DATABASE_URL no arquivo .env

## Instalacao

```bash
npm install
```

## Configuracao de ambiente

Crie ou ajuste o arquivo .env com as variaveis minimas:

```env
PORT=3000
DATABASE_URL="postgresql://usuario:senha@localhost:5432/webapptcc?schema=public"
JWT_SECRET="uma_chave_forte"
```

## Migracoes e Prisma

```bash
npx prisma migrate dev
npx prisma generate
```

Para ambiente de producao, prefira:

```bash
npx prisma migrate deploy
```

## Executar localmente

```bash
# desenvolvimento
npm run start:dev

# producao (apos build)
npm run build
npm run start:prod
```

## Documentacao da API (Swagger/OpenAPI)

- Swagger UI: http://localhost:3000/api/docs
- JSON para importacao: http://localhost:3000/api/docs-json
- Fonte da especificacao: openapi.yaml

## Importar rotas no Insomnia

1. Inicie a API com npm run start:dev.
2. No Insomnia, clique em Create > Import > URL.
3. Cole: http://localhost:3000/api/docs-json.
4. Confirme a importacao para gerar colecao e endpoints automaticamente.

## Testes automatizados

```bash
# unitarios
npm run test

# e2e
npm run test:e2e

# cobertura
npm run test:cov
```

Observacao: Beekeeper Studio e um cliente visual para inspeção SQL. Para automacao de testes, use Jest e testes e2e.
