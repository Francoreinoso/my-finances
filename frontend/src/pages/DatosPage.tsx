import { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { backupClient } from '@/api/backupClient';
import { API_BASE_URL } from '@/api/http';

type BackupState =
  | { status: 'idle' }
  | { status: 'working' }
  | { status: 'done'; fileName: string }
  | { status: 'error'; message: string };

export function DatosPage() {
  const [backup, setBackup] = useState<BackupState>({ status: 'idle' });

  const handleBackup = async () => {
    setBackup({ status: 'working' });
    try {
      const result = await backupClient.create();
      setBackup({ status: 'done', fileName: result.fileName });
    } catch (e) {
      setBackup({
        status: 'error',
        message: e instanceof Error ? e.message : 'No se pudo crear el backup',
      });
    }
  };

  return (
    <section className="mx-auto max-w-2xl">
      <header className="mb-6">
        <h1 className="font-mono text-3xl tracking-tight text-text-primary">Datos</h1>
        <p className="text-sm text-text-muted">
          Respaldá tu base de datos y exportá tus movimientos.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-border-default bg-bg-surface/70 p-5 backdrop-blur-sm">
          <h2 className="font-medium text-text-primary">Respaldo</h2>
          <p className="mt-1 text-sm text-text-muted">
            Copia el archivo de base de datos a la carpeta{' '}
            <code className="rounded bg-bg-elevated px-1 font-mono text-xs">data/backups/</code>,
            con la fecha en el nombre.
          </p>
          <div className="mt-4">
            <Button onClick={() => void handleBackup()} disabled={backup.status === 'working'}>
              {backup.status === 'working' ? 'Creando…' : 'Crear backup'}
            </Button>
          </div>
          {backup.status === 'done' && (
            <p className="mt-3 text-sm text-success">Backup creado: {backup.fileName}</p>
          )}
          {backup.status === 'error' && (
            <p
              role="alert"
              className="mt-3 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
            >
              {backup.message}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-border-default bg-bg-surface/70 p-5 backdrop-blur-sm">
          <h2 className="font-medium text-text-primary">Exportar transacciones</h2>
          <p className="mt-1 text-sm text-text-muted">
            Descargá todos tus movimientos en CSV — para abrir en Excel o pasarle a un contador.
          </p>
          <div className="mt-4">
            <a
              href={`${API_BASE_URL}/transactions/export`}
              download="transacciones.csv"
              className="inline-flex items-center rounded-md border border-border-default px-4 py-2 text-sm text-text-primary transition-colors hover:border-accent hover:text-accent"
            >
              Exportar CSV
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
