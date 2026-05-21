interface EmptyStateProps {
  /** Mensaje principal: qué falta. */
  title: string;
  /** Pista opcional: cómo empezar. */
  hint?: string;
}

/**
 * Estado vacío para listas sin contenido: una tarjeta punteada, centrada,
 * con `role="status"` para que un lector de pantalla lo anuncie.
 */
export function EmptyState({ title, hint }: EmptyStateProps) {
  return (
    <div
      role="status"
      className="rounded-lg border border-dashed border-border-default bg-bg-surface/40 px-6 py-12 text-center text-text-muted"
    >
      <p className="font-medium text-text-primary">{title}</p>
      {hint !== undefined && <p className="mt-1 text-sm">{hint}</p>}
    </div>
  );
}
