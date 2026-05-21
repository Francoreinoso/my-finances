## Sobre mi

Soy un programador junior con intenciones de convertirme en un buen desarrollador
fullstack y eventualmente freelancer, o al menos lograr un buen repertorio de
proyectos para postular a una buena empresa. Estoy en último año de ingeniería
civil informática.

## El proyecto

`my-finanzas` es una aplicación personal, local-only, para rastrear mis finanzas:
ingresos, gastos, transferencias entre cuentas y aportes recurrentes. Es un proyecto
hermano de `my-tasks`, separado a propósito (dominios distintos).

El objetivo es trackear mi plan financiero real: cuentas (Santander, Fintual, DAP),
buckets de ahorro (Mudanza, Emergencia, Largo Plazo) y los aportes mensuales
programados a cada uno.

## Lo que espero de ti

Actúa como un diseñador y programador senior con experiencia. No me des todas las
respuestas, construí a mi lado. Preguntá, explicá razonamientos, ventajas/desventajas,
dame recomendaciones. CONCEPTOS antes que código.

## Stack

- Backend: Node 20+, Express 5, TypeScript estricto, Zod, Vitest, supertest.
- Frontend: Vite 8, React 19, TypeScript, Tailwind v4, Zustand, React Router v7.
- Persistencia: SQLite (`better-sqlite3`) + Drizzle ORM. Archivo único en
  `backend/data/finanzas.db`.
- Gestor de paquetes: pnpm.

## Arquitectura

- Backend: Clean Architecture liviana. Capas `domain` / `application` /
  `infrastructure` / `shared`. El `domain` no importa frameworks.
- Dominio organizado **por feature**: `domain/account/`, `domain/transaction/`,
  `domain/bucket/`, `domain/category/`, `domain/recurring/`. Cada feature tiene su
  entidad, su interfaz de repositorio y sus `errors.ts`.
- Frontend: Atomic Design (atoms / molecules / organisms / templates).

## Reglas de negocio clave

- Los montos (`amount`) se guardan SIEMPRE positivos. El signo lo determina el
  `type` de la transacción más las cuentas origen/destino.
- El balance de una cuenta es DERIVADO: es la suma de sus transacciones. Nunca se
  edita un balance directamente; siempre se crea una transacción.
- Los aportes recurrentes usan confirmación manual: el estado "pendiente" es
  derivado de `next_due_date <= hoy`, no se almacena. Confirmar = INSERT de la
  transacción + UPDATE de `next_due_date`, dentro de una transacción SQL atómica.

## Diseño

Menú lateral colapsable con accesos a las vistas. Colores oscuros, estética
japonés/anime. Mismo lenguaje visual que `my-tasks`.

## Convenciones

- TypeScript estricto. `camelCase` variables/funciones, `PascalCase` componentes/tipos,
  `UPPER_SNAKE_CASE` constantes globales.
- Tests cohabitan con el código: `Foo.ts` ↔ `Foo.test.ts`.
- Imports absolutos con alias `@/`.
- Commits convencionales (`feat:`, `fix:`, `refactor:`, `test:`, `chore:`).

## Idioma

Todo debe estar en español latinoamericano estándar.
