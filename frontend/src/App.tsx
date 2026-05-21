import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AppLayout } from '@/components/templates/AppLayout';
import { TransaccionesPage } from '@/pages/TransaccionesPage';
import { BucketsPage } from '@/pages/BucketsPage';

export function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<TransaccionesPage />} />
          <Route path="/buckets" element={<BucketsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
