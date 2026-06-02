import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AppLayout } from '@/components/templates/AppLayout';
import { TransaccionesPage } from '@/pages/TransaccionesPage';
import { BucketsPage } from '@/pages/BucketsPage';
import { RecurrentesPage } from '@/pages/RecurrentesPage';
import { CuentasPage } from '@/pages/CuentasPage';
import { ResumenPage } from '@/pages/ResumenPage';
import { CategoriasPage } from '@/pages/CategoriasPage';
import { DatosPage } from '@/pages/DatosPage';

export function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<TransaccionesPage />} />
          <Route path="/buckets" element={<BucketsPage />} />
          <Route path="/recurrentes" element={<RecurrentesPage />} />
          <Route path="/cuentas" element={<CuentasPage />} />
          <Route path="/categorias" element={<CategoriasPage />} />
          <Route path="/resumen" element={<ResumenPage />} />
          <Route path="/datos" element={<DatosPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
