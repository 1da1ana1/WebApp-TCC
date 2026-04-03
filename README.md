# WebAppTCC

Monorepo da plataforma de gestao de TCC com duas aplicacoes independentes:

- `apps/api`: backend NestJS + Prisma
- `apps/web`: frontend Vue 3 + Vite

Este projeto foi desenvolvido para oferecer uma experiencia de uso fluida e responsiva, com foco em organizacao do codigo, manutencao e evolucao do sistema.

## Stack

- **Frontend:** Vue.js, JavaScript, CSS3, HTML5
- **Backend:** NestJS, Prisma
- **Versionamento:** Git

## Requisitos

- Node.js 20+
- npm instalado
- Banco de dados configurado para a API via `DATABASE_URL`

## Instalacao

Instale as dependencias em cada aplicacao:

```bash
cd apps/api
npm install

cd ../web
npm install
```

## Executar em desenvolvimento

Backend:

```bash
cd apps/api
npm run start:dev
```

Frontend:

```bash
cd apps/web
npm run dev
```

## Testes automatizados

### Backend

Execute os testes da API dentro de `apps/api`:

```bash
cd apps/api
npm run test
npm run test:watch
npm run test:cov
npm run test:e2e
```

### Frontend

Execute os testes da interface dentro de `apps/web`:

```bash
cd apps/web
npm run test:unit
npm run test:e2e
```

### Observacoes

- Os testes do backend usam Jest.
- Os testes unitarios do frontend usam Vitest.
- Os testes end-to-end do frontend usam Playwright; na primeira execucao, pode ser necessario instalar os navegadores com `npx playwright install` dentro de `apps/web`.

---
Desenvolvido por [Yasmim Daiana](https://github.com/1da1ana1)
