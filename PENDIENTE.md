# Pendiente — follow-up del audit de diseño

> **Contexto** (sesión 2026-05-21): se auditó el frontend con 3 skills de diseño
> (skills.sh: anthropics/frontend-design, vercel/web-design-guidelines,
> nextlevelbuilder/ui-ux-pro-max) y se implementaron **P0 (5 items)** y
> **P1 (8 items)**. Detalle completo en engram, topics:
> `design/frontend-audit`, `design/p0-implementation`, `design/p1-implementation`.

## ⚠️ Estado

- P0, P1 y P2 del audit están **implementados** (sesión 2026-05-21).
- Dependencia agregada en P1: `@tanstack/react-virtual@3.13.25`.
- Tests: el proyecto pasó de **0 a 38** tests, todos en verde.
  Verificar con `pnpm test` y `pnpm exec tsc --noEmit -p tsconfig.app.json`.

## 1. Verificación visual pendiente

La tabla virtualizada (P1 #13) **no está cubierta por tests** — jsdom no tiene
layout real, así que el scroll virtual no se puede ejercitar en un unit test.
Levantar `pnpm dev` y verificar a ojo:

- Scroll virtual de la tabla de transacciones (solo se renderizan las filas visibles).
- Filtros por mes / tipo / categoría.
- Modales de editar y borrar (ahora viven en `TransactionTable`, no en la fila).
- Que las fuentes (JetBrains Mono), el `color-scheme: dark` y el contraste se vean OK.
- **P2**: los skeletons de carga — que cada variante reserve el layout sin salto.
- **P2**: los toasts — que aparezcan abajo a la derecha al crear/editar/confirmar
  y al crear un backup, y que se auto-descarten a los 4 s.

## 2. P2 del audit — polish (hecho, salvo drawer)

- [x] **Skeletons de carga** — componente `PageSkeleton` (variantes
      `cards`/`rows`/`table`/`summary`) reemplaza el texto `"Cargando…"` en las
      5 páginas. Reserva el layout y expone `role="status"` + texto `sr-only`.
- [x] **Feedback de éxito + `aria-live`** — store de Zustand `useToasts` (el
      primer store del proyecto) + organismo `Toaster`. Cada toast es su propia
      región viva: `role="status"` (éxito) / `role="alert"` (error). `notify`
      wireado en los 4 hooks de datos y en el backup de `DatosPage`.
- [x] **Touch targets** — los 4 botones `text-xs` Editar/Borrar migraron al
      átomo `Button` (nueva prop `size`). En la tabla virtualizada ocupan los
      44px de alto de la fila.
- [~] **Drawer mobile** — descartado: la app es solo de escritorio (decisión
      2026-05-21). Fuera de alcance.
- [x] **CSS muerto** — `mf-fade-in-up` ahora anima la entrada del `Modal` y de
      cada toast.
- [x] ~~Hover en filas de tabla~~ — hecho: `TransactionRow` ya tiene
      `hover:bg-bg-elevated/40` (entró con #13).

## 3. Deuda de lint pre-existente (aparte del audit)

6 errores `react-hooks/set-state-in-effect` (eslint-plugin-react-hooks v7) —
patrón `void load()` dentro de `useEffect`. Archivos:

- `frontend/src/hooks/useFinances.ts`
- `frontend/src/hooks/useBuckets.ts`
- `frontend/src/hooks/useCategories.ts`
- `frontend/src/hooks/useRecurring.ts`
- `frontend/src/hooks/useMonthlySummary.ts`
- `frontend/src/components/molecules/CategoryDonut.tsx`

(+ 1 warning benigno en `TransactionTable.tsx`: el React Compiler no memoiza el
componente por usar `useVirtualizer` — tradeoff documentado de TanStack Virtual,
no es un bug.)

## 4. Identidad visual (lente Anthropic frontend-design)

El concepto está (anime oscuro, ojo prismático) pero el diferenciador —el prisma—
casi no aparece: hoy solo vive en la barra de progreso de buckets. Empujarlo:
nav activo, focus rings, el donut de categorías, detalles de header.
