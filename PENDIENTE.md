# Pendiente — follow-up del audit de diseño

> **Contexto** (sesión 2026-05-21): se auditó el frontend con 3 skills de diseño
> (skills.sh: anthropics/frontend-design, vercel/web-design-guidelines,
> nextlevelbuilder/ui-ux-pro-max) y se implementaron **P0 (5 items)** y
> **P1 (8 items)**. Detalle completo en engram, topics:
> `design/frontend-audit`, `design/p0-implementation`, `design/p1-implementation`.

## ⚠️ Antes que nada

- **Nada está commiteado.** Toda la sesión quedó en el working tree — revisar y commitear.
- Dependencia nueva agregada: `@tanstack/react-virtual@3.13.25`.
- Tests: el proyecto pasó de **0 a 25** tests, todos en verde.
  Verificar con `pnpm test` y `pnpm exec tsc --noEmit -p tsconfig.app.json`.

## 1. Verificación visual pendiente

La tabla virtualizada (P1 #13) **no está cubierta por tests** — jsdom no tiene
layout real, así que el scroll virtual no se puede ejercitar en un unit test.
Levantar `pnpm dev` y verificar a ojo:

- Scroll virtual de la tabla de transacciones (solo se renderizan las filas visibles).
- Filtros por mes / tipo / categoría.
- Modales de editar y borrar (ahora viven en `TransactionTable`, no en la fila).
- Que las fuentes (JetBrains Mono), el `color-scheme: dark` y el contraste se vean OK.

## 2. P2 del audit — polish (sin empezar)

- [ ] **Skeletons de carga** — hoy las páginas muestran `"Cargando…"` en texto
      plano. Reemplazar por skeletons que reserven el layout (evita layout shift).
- [ ] **Feedback de éxito + `aria-live`** — no hay confirmación al crear/editar/
      confirmar. El backup en `DatosPage` tampoco se anuncia a lectores de pantalla.
- [ ] **Touch targets** — los botones "Editar"/"Borrar" (`text-xs`) están por
      debajo de los 44×44px recomendados. Agrandar el área tocable.
- [ ] **Drawer mobile** — el sidebar `w-60` no colapsa a drawer en pantallas
      chicas (baja prioridad si la app es solo de escritorio).
- [ ] **CSS muerto** — `mf-fade-in-up` está definido en `frontend/src/styles/globals.css`
      pero no se usa en ningún componente. Usarlo o borrarlo.
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
