# my-finanzas

Aplicación personal para rastrear finanzas: ingresos, gastos, transferencias entre
cuentas y aportes recurrentes. Pensada para uso local desde el escritorio
(Windows + WSL), single-user, sin nube.

> Estado actual: **bootstrap**. Estructura, configs y schema iniciales listos.
> La Fase 1 (CRUD de transacciones + balance por cuenta) está en desarrollo.

## Stack

| Capa | Tecnologías |
|------|-------------|
| Frontend | Vite 8, React 19, TypeScript, Tailwind CSS v4, Zustand, React Router v7, Vitest, Testing Library |
| Backend | Node 20+, Express 5, TypeScript, Zod, Vitest, supertest |
| Persistencia | SQLite (`better-sqlite3`) + Drizzle ORM — archivo único `backend/data/finanzas.db` |
| Tooling | ESLint, Prettier, EditorConfig |

## Estructura del repo

```
my-finanzas/
├── backend/         API REST (Clean Architecture liviana)
│   ├── src/
│   │   ├── domain/         entidades + interfaces de repositorio, por feature
│   │   ├── application/    casos de uso, por feature
│   │   ├── infrastructure/ HTTP (Express) + persistencia (SQLite/Drizzle)
│   │   └── shared/         schemas Zod, utilidades
│   ├── data/        # finanzas.db (gitignored, se crea en runtime)
│   └── drizzle/     # migraciones generadas por drizzle-kit
├── frontend/        SPA (Atomic Design)
│   └── src/
│       ├── components/  atoms / molecules / organisms / templates
│       ├── pages/       containers de cada vista
│       ├── hooks/       useTransactions, useAccounts, etc.
│       ├── store/       Zustand stores
│       ├── api/         cliente HTTP
│       ├── types/       tipos compartidos
│       └── styles/      tema oscuro/anime con CSS variables
├── scripts/
│   └── start-app.sh    arranca backend + frontend juntos
├── CLAUDE.md
└── README.md
```

## Requisitos

- Node.js >= 20
- pnpm >= 10 (instalalo con `npm i -g pnpm` o `corepack enable`)
- WSL2 (Ubuntu) si estás en Windows

## Primera vez

```bash
cd backend  && pnpm install
cd ../frontend && pnpm install
```

La base de datos SQLite se crea automáticamente en `backend/data/finanzas.db`
la primera vez que arranca el backend, junto con el seed inicial.

## Arranque (todos los días)

```bash
./scripts/start-app.sh
# o que abra el browser automáticamente:
./scripts/start-app.sh --open
```

Esto arranca:
- Backend en `http://localhost:4001`
- Frontend en `http://localhost:5174`

`Ctrl+C` apaga ambos limpiamente.

## Tests

```bash
# backend
cd backend && pnpm test
# frontend
cd frontend && pnpm test
```

## Base de datos

```bash
# generar migración tras cambiar el schema
cd backend && pnpm db:generate
# aplicar migraciones pendientes
cd backend && pnpm db:migrate
```

## Convenciones

- TypeScript estricto (`strict: true`, `exactOptionalPropertyTypes: true`,
  `noUncheckedIndexedAccess: true`).
- `camelCase` para variables/funciones, `PascalCase` para componentes y tipos,
  `UPPER_SNAKE_CASE` para constantes globales.
- Dominio organizado **por feature** (`domain/account/`, `domain/transaction/`).
- Tests cohabitan con el código: `Foo.ts` ↔ `Foo.test.ts`.
- Imports absolutos con alias `@/`.
- Commits convencionales (`feat:`, `fix:`, `refactor:`, `test:`, `chore:`).
- Idioma: español latinoamericano estándar.

## Variables de entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `PORT` (backend) | `4001` | Puerto del API |
| `FRONTEND_ORIGIN` (backend) | `http://localhost:5174` | Origen permitido por CORS |
| `DB_PATH` (backend) | `data/finanzas.db` | Ruta del archivo SQLite |
| `VITE_API_URL` (frontend) | `http://localhost:4001/api` | Base URL del API |
