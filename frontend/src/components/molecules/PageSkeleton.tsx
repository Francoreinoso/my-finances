type SkeletonVariant = 'cards' | 'rows' | 'table' | 'summary';

interface PageSkeletonProps {
  /** Forma del contenido que está cargando, para reservar su layout. */
  variant: SkeletonVariant;
}

/**
 * Bloque visual con pulso. Es puramente decorativo: `aria-hidden` lo oculta a
 * los lectores de pantalla (el anuncio lo da el texto sr-only de PageSkeleton).
 * `motion-safe` desactiva el pulso si el usuario pidió menos movimiento.
 */
function Block({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-md bg-bg-elevated motion-safe:animate-pulse ${className}`}
    />
  );
}

function range(n: number) {
  return Array.from({ length: n }, (_, i) => i);
}

/**
 * Placeholder de carga que imita la forma del contenido real para reservar su
 * espacio y evitar el layout shift cuando los datos llegan. Reemplaza al texto
 * plano "Cargando…": expone `role="status"` y un texto accesible para que la
 * carga la anuncien también los lectores de pantalla.
 */
export function PageSkeleton({ variant }: PageSkeletonProps) {
  return (
    <div role="status">
      <span className="sr-only">Cargando…</span>

      {variant === 'cards' && (
        <div className="flex flex-col gap-4">
          {range(3).map((i) => (
            <Block key={i} className="h-36" />
          ))}
        </div>
      )}

      {variant === 'rows' && (
        <div className="flex flex-col gap-2">
          {range(5).map((i) => (
            <Block key={i} className="h-12" />
          ))}
        </div>
      )}

      {variant === 'table' && (
        <div className="flex flex-col gap-6">
          <Block className="h-20" />
          <div className="flex flex-col gap-3">
            <Block className="h-10" />
            <Block className="h-80" />
          </div>
        </div>
      )}

      {variant === 'summary' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {range(4).map((i) => (
              <Block key={i} className="h-20" />
            ))}
          </div>
          <Block className="h-64" />
        </div>
      )}
    </div>
  );
}
