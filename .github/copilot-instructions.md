# Copilot Instructions for WebAppTCC

## Project Structure (Monorepo)

**WebAppTCC** is a full-stack TCC (graduation thesis) management system organized as a monorepo with two independent applications:

```
webapptcc/
├── apps/
│   ├── web/              # Vue 3 + Vite Frontend
│   │   ├── src/
│   │   ├── package.json
│   │   └── ... (frontend config files)
│   │
│   └── api/              # NestJS REST API Backend
│       ├── src/
│       ├── prisma/       # Database schema & migrations
│       ├── package.json
│       └── ... (backend config files)
│
├── .github/
│   └── copilot-instructions.md  (this file)
├── package.json          (root monorepo config)
└── node_modules/
```

## Backend Architecture (NestJS)

### Project Structure
- `apps/api/src/` - Application source code
  - `app/routes/` - Main application modules (Teachers, Solicitações)
  - `auth/` - JWT & Passport-based authentication (JwtStrategy)
  - `app/services/` - Business logic (TeachersService, RequestService)
  - `main.ts` - Application entry point
- `apps/api/prisma/` - Database schema and migrations (SQLite)

### Key Patterns
1. **Modular Architecture**: Each feature (Teachers, Solicitações) is a complete module with controller, service, DTO
2. **Prisma ORM**: Relations defined in `schema.prisma` - always reference this for understanding data flows
3. **Data Validation**: Use `class-validator` + DTOs in `dto/` folders (e.g., `create-teacher.dto.ts`)
4. **Authentication**: JWT via Passport; JwtStrategy guards protected routes

### Database Schema Essentials
- **User** (base model): email, password, typeUser (student/teacher/coordinator)
- **Student**: links to User via userId, has Requests and Orientations
- **Teacher**: links to User, manages Requests and Orientations
- **Request**: student→teacher orientation request with status and denial justification
- **Orientation**: one-to-many with Student, many-to-many Teachers via OrientationMember

### Build & Run Commands
```bash
cd apps/api
npm install
npm run start:dev        # Watch mode for development
npm run build            # Compile TypeScript
npm run lint             # Fix ESLint issues (auto-fix enabled)
npm run test             # Unit tests with Jest
npm run test:e2e         # End-to-end tests
```

### Common Workflows
- **Add new endpoint**: Create DTO in `routes/[module]/dto/`, update service, add controller method, register in module
- **Modify schema**: Update `apps/api/prisma/schema.prisma`, run `npx prisma migrate dev --name <migration_name>`
- **Authentication**: New protected routes need `@UseGuards(JwtAuthGuard)` on controller method

## Frontend Architecture (Vue 3 + Vite)

### Project Structure
- `apps/web/src/` - Application source code
  - `views/` - Page-level components (Login, Dashboard, Profile views)
  - `components/` - Reusable components (FilterBar, SearchResult, StudentCard, etc.)
  - `services/api.js` - Axios instance with hardcoded `baseURL: http://localhost:3000`
  - `stores/` - Pinia stores (auth.js, counter.js)
  - `router/index.js` - Vue Router with layout meta tags
  - `main.js` - Application entry point

### Key Patterns
1. **Layout Routing**: Routes use `meta: { layout: 'public' }` to switch between PublicLayout and SystemLayout
2. **State Persistence**: Pinia store with `pinia-plugin-persistedstate` auto-saves auth state to localStorage
3. **API Integration**: Axios calls in service files; auth token should be added to API headers (currently missing)
4. **Component Library**: Bootstrap Icons for UI (removed unused Bootstrap Vue)

### Authentication State (Pinia)
- Mock authentication in `auth.js` (hardcoded credentials: `aluno@unicamp.br` / `123456`)
- TODO: Replace mock with actual API calls to backend `/auth/login` endpoint
- TODO: Add JWT token to all API requests via axios interceptor

### Build & Run Commands
```bash
cd apps/web
npm install
npm run dev              # Vite dev server (hot reload)
npm run build            # Production build
npm run lint             # ESLint with auto-fix
npm run test:unit        # Vitest unit tests
npm run test:e2e         # Playwright E2E tests
```

### Common Workflows
- **Create route**: Add to `apps/web/src/router/index.js` with component path; use `meta: { layout }` to control layout
- **Add API call**: Extend `apps/web/src/services/api.js` with new function, use axios error handling
- **New component**: Follow naming (e.g., `StudentCard.vue`), keep logic in `<script setup>`, use CSS for styling

## Cross-Stack Integration

### API Communication
- **Endpoint Pattern**: Backend serves `/teachers`, `/auth/login`, `/solicitacoes` on port 3000
- **Current Status**: Frontend API client exists but missing JWT interceptor and error handling for login failure
- **Missing Integration**: Mock login → needs real backend endpoint connection

### Environment & Configuration
- **Backend**: Reads `PORT` env var (default 3000), JWT secret from `JWT_SECRET`
- **Frontend**: Hardcoded API base URL in `apps/web/src/services/api.js` (should use `.env`)
- **Database**: SQLite file location depends on `DATABASE_URL` env var

## Testing Strategy
- **Backend**: Jest for unit/integration tests; E2E tests with `jest-e2e.json` config
- **Frontend**: Vitest for unit tests, Playwright for E2E tests (requires browser install)

## Code Quality Standards
- **Formatting**: Prettier for all files
- **Linting**: ESLint with auto-fix enabled
- **TypeScript**: Strict mode enforced in backend (`tsconfig.json`)
- **Naming**: Snake_case for database columns, camelCase for JS/TS

## Critical Files & References
- [Schema](apps/api/prisma/schema.prisma) - Single source of truth for data model
- [App Module](apps/api/src/app/routes/app.module.ts) - Dependency injection root
- [Auth Module](apps/api/src/auth/auth.module.ts) - Security & session management
- [Frontend App](apps/web/src/App.vue) - Layout routing logic
- [Router Config](apps/web/src/router/index.js) - Route definitions with layout assignment

## Monorepo Workflow

### Development (Both Apps)
To run both applications simultaneously during development:

```bash
# Terminal 1: Start backend API
cd apps/api
npm run start:dev

# Terminal 2: Start frontend dev server
cd apps/web
npm run dev
```

Backend runs on `http://localhost:3000`  
Frontend runs on `http://localhost:5173` (Vite default)
