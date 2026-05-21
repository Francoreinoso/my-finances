import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AppLayout } from '@/components/templates/AppLayout';
import { TransaccionesPage } from '@/pages/TransaccionesPage';
import { BucketsPage } from '@/pages/BucketsPage';
import { RecurrentesPage } from '@/pages/RecurrentesPage';
import { ResumenPage } from '@/pages/ResumenPage';
import { CategoriasPage } from '@/pages/CategoriasPage';

export function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<TransaccionesPage />} />
          <Route path="/buckets" element={<BucketsPage />} />
          <Route path="/recurrentes" element={<RecurrentesPage />} />
          <Route path="/resumen" element={<ResumenPage />} />
          <Route path="/categorias" element={<CategoriasPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
