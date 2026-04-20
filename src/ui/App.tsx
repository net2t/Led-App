import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import { ensureDefaultSettings } from '../db/db';
import AppShell from './components/AppShell';
import DashboardPage from './pages/DashboardPage';
import CasesPage from './pages/CasesPage';
import CaseDetailPage from './pages/CaseDetailPage';
import ConsultantsPage from './pages/ConsultantsPage';
import MonthlyChecksPage from './pages/MonthlyChecksPage';
import PaymentsPage from './pages/PaymentsPage';
import BackupPage from './pages/BackupPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  useEffect(() => {
    ensureDefaultSettings();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/cases/:id" element={<CaseDetailPage />} />
          <Route path="/consultants" element={<ConsultantsPage />} />
          <Route path="/monthly-checks" element={<MonthlyChecksPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/backup" element={<BackupPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </AppShell>
    </ThemeProvider>
  );
}
