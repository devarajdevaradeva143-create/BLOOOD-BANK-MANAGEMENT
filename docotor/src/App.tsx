import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { ThemeProvider } from './context/ThemeContext';
import { I18nProvider } from './i18n/I18nContext';
import { AuthProvider } from './context/AuthContext';
import { UnitProvider } from './context/UnitContext';
import { AppToaster } from './components/AppToaster';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BloodUnitsPage from './pages/BloodUnitsPage';
import AddUnitPage from './pages/AddUnitPage';
import TestingPage from './pages/TestingPage';
import ExpiryPage from './pages/ExpiryPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <UnitProvider>
            <BrowserRouter>
              <AppToaster />
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/units" element={<BloodUnitsPage />} />
                    <Route path="/units/new" element={<AddUnitPage />} />
                    <Route path="/testing" element={<TestingPage />} />
                    <Route path="/expiry" element={<ExpiryPage />} />
                    <Route path="/history" element={<HistoryPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>
                </Route>
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </BrowserRouter>
          </UnitProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
