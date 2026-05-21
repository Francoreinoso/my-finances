import { useState, type ReactNode } from 'react';
import { Sidebar } from '@/components/organisms/Sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="relative flex min-h-screen text-text-primary">
      {/* Capa 1: imagen de fondo con blur sutil */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/bg-anime-eye.png)',
          filter: 'blur(4px)',
          transform: 'scale(1.05)',
        }}
      />

      {/* Capa 2: velo oscuro + destellos prismáticos para teñir la imagen
          y mantener el texto legible sobre una imagen de alto contraste. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundColor: 'rgba(11, 10, 16, 0.82)',
          backgroundImage: [
            'radial-gradient(circle at 22% 28%, rgba(139, 92, 255, 0.12), transparent 55%)',
            'radial-gradient(circle at 80% 72%, rgba(69, 214, 230, 0.07), transparent 55%)',
            'radial-gradient(circle at 50% 100%, rgba(214, 92, 255, 0.05), transparent 50%)',
          ].join(', '),
        }}
      />

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
