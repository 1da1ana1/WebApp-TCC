# WebAppTCC

Sistema de gerenciamento de TCC, orientacoes, solicitacoes e vagas. O repositorio e um monorepo com duas aplicacoes independentes:

- `apps/api`: API REST em NestJS, Prisma e PostgreSQL.
- `apps/web`: interface web em Vue 3, Vite e Pinia.

## 1. Requisitos

Para executar em modo local:

- Node.js 20 ou superior.
- npm 10 ou superior.
- PostgreSQL 16 ou superior, localmente ou em container.

Para executar tudo com Docker:

- Docker Desktop com Docker Compose.

O Git e recomendado para clonar e atualizar o projeto.

## 2. Estrutura de pastas

```text
webapptcc/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── auth/              # Login, JWT, guards e DTOs
│   │   │   ├── common/            # Validacoes e recursos compartilhados
│   │   │   └── modules/           # Features da API
│   │   ├── prisma/
│   │   │   ├── schema.prisma      # Modelos e relacoes do banco
│   │   │   └── migrations/        # Historico das alteracoes do banco
│   │   ├── test/                  # Testes end-to-end
│   │   └── seed.ts                # Usuarios e keywords de teste
│   └── web/
│       ├── src/
│       │   ├── components/         # Componentes reutilizaveis
│       │   ├── layouts/            # Layouts publico e do sistema
│       │   ├── router/             # Rotas do Vue Router
│       │   ├── services/           # Comunicacao com a API
│       │   ├── stores/             # Estado global Pinia
│       │   ├── views/              # Paginas da aplicacao
│       │   └── App.vue             # Componente raiz
│       └── e2e/                    # Testes Playwright
├── docker-compose.yml              # PostgreSQL + API + Nginx
└── .env.example                    # Variaveis do Docker Compose
```

Os modulos atuais da API incluem autenticacao, professores, alunos, solicitacoes, orientacoes, semestres, vagas, contestacoes, whitelist, relatorios, notificacoes, logs e keywords.

## 3. Clonar o projeto

```bash
git clone <URL_DO_REPOSITORIO>
cd webapptcc
```

## 4. Execucao local

### 4.1 Iniciar o PostgreSQL

Com PostgreSQL instalado, crie um banco chamado `webapp_db` e confirme que o servidor esta ativo.

Como alternativa, use um container apenas para o banco:

```bash
docker run --name webapptcc-postgres `
	-e POSTGRES_USER=postgres `
	-e POSTGRES_PASSWORD=postgres `
	-e POSTGRES_DB=webapp_db `
	-p 5432:5432 `
	-d postgres:16-alpine
```

No PowerShell, o caractere de continuacao e a crase. Em bash, substitua as crases por `\` ou execute o comando em uma linha.

### 4.2 Configurar a API

No PowerShell:

```powershell
Copy-Item apps/api/.envExample apps/api/.env
```

No macOS/Linux:

```bash
cp apps/api/.envExample apps/api/.env
```

Edite `apps/api/.env`:

```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/webapp_db?schema=public"
JWT_SECRET="troque-por-um-segredo-local"
```

Instale as dependencias, gere o cliente Prisma e aplique as migrations:

```bash
cd apps/api
npm install
npx prisma generate
npx prisma migrate deploy
```

Para um banco de desenvolvimento novo, `npx prisma migrate dev` tambem pode ser usado.

Opcionalmente, carregue dados de teste:

```bash
npm run prisma:seed
```

O seed cria estes acessos, todos com senha `123456`:

| Perfil | E-mail |
|---|---|
| Aluno | `aluno@unicamp.br` |
| Professor | `professor@unicamp.br` |
| Coordenador | `coord@unicamp.br` |

Inicie a API e mantenha este terminal aberto:

```bash
npm run start:dev
```

API: `http://localhost:3000`
Swagger: `http://localhost:3000/api/docs`
OpenAPI JSON: `http://localhost:3000/api/docs-json`

### 4.3 Configurar e iniciar o frontend

Em outro terminal, crie o arquivo de ambiente:

PowerShell:

```powershell
Copy-Item apps/web/.env.example apps/web/.env
```

macOS/Linux:

```bash
cp apps/web/.env.example apps/web/.env
```

Mantenha esta configuracao para desenvolvimento:

```env
VITE_API_BASE_URL=/api
```

Instale e execute:

```bash
cd apps/web
npm install
npm run dev
```

Frontend: `http://localhost:5000`
O Vite encaminha requisicoes `/api` para a API em `http://localhost:3000`.

## 5. Execucao completa com Docker Compose

Este fluxo sobe PostgreSQL, API NestJS e frontend servido pelo Nginx.

1. Crie o ambiente da raiz:

PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

2. Ajuste, principalmente, `POSTGRES_PASSWORD` e `JWT_SECRET` no `.env`:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=webapp_db
JWT_SECRET=troque-por-um-segredo-forte
API_PORT=3000
WEB_PORT=8080
```

3. Construa e inicie os servicos:

```bash
docker compose up --build
```

A API aplica as migrations automaticamente antes de iniciar. Acesse:

- Sistema web: `http://localhost:8080`
- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api/docs`

Para executar em segundo plano:

```bash
docker compose up --build -d
```

Comandos uteis:

```bash
docker compose ps
docker compose logs -f api
docker compose down
```

`docker compose down` preserva os dados no volume `pgdata`. Para apagar tambem o banco:

```bash
docker compose down -v
```

O Compose nao executa o seed automaticamente. Para dados iniciais, use o fluxo local ou prepare um seed especifico para a imagem de producao.

## 6. Banco de dados e Prisma

O banco e PostgreSQL. A variavel `DATABASE_URL` segue este formato:

```text
postgresql://USUARIO:SENHA@HOST:PORTA/BANCO?schema=public
```

Principais comandos, dentro de `apps/api`:

```bash
npx prisma generate       # gera o Prisma Client
npx prisma migrate dev    # cria/aplica migration em desenvolvimento
npx prisma migrate deploy # aplica migrations existentes
npx prisma studio         # abre o visualizador do banco
npm run prisma:seed       # insere dados de teste
```

O schema e as migrations ficam em `apps/api/prisma/`. Nao altere tabelas diretamente em um ambiente compartilhado; altere o schema e crie uma migration.

## 7. Testes e qualidade

API, dentro de `apps/api`:

```bash
npm run test
npm run test:watch
npm run test:cov
npm run test:e2e
npm run lint
```

Os testes e2e da API usam um PostgreSQL descartavel na porta `5433`:

```bash
npm run db:test:up
npm run db:test:prepare
npm run test:e2e
npm run db:test:down
```

Frontend, dentro de `apps/web`:

```bash
npm run test:unit
npm run build
npm run lint
npx playwright install   # uma vez, antes do primeiro e2e
npm run test:e2e
```

## 8. Solucao de problemas

- **Erro de conexao com o banco:** confirme se o PostgreSQL esta ativo e se `DATABASE_URL`, usuario, senha, porta e nome do banco estao corretos.
- **Prisma Client desatualizado:** execute `npx prisma generate` dentro de `apps/api`.
- **Porta ocupada:** altere `PORT` na API, `API_PORT`/`WEB_PORT` no Compose ou libere a porta usada.
- **Frontend sem resposta da API:** confirme que a API esta em `3000` e que `VITE_API_BASE_URL=/api` esta configurado.
- **Docker com dados inconsistentes:** pare os servicos e use `docker compose down -v`; isso apaga o banco e exige executar novamente o Compose.
