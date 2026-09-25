import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'
import ThemedToaster from './components/ThemedToaster'
import { LanguageProvider } from './context/LanguageProvider'
import { ThemeProvider } from './context/ThemeProvider'
import AvailabilityPage from './pages/AvailabilityPage'
import ContactPage from './pages/ContactPage'
import EmergencyPage from './pages/EmergencyPage'
import FaqPage from './pages/FaqPage'
import HomePage from './pages/HomePage'
import HospitalHome from './pages/HospitalHome'
import HospitalLogin from './pages/HospitalLogin'
import HospitalRegister from './pages/HospitalRegister'
import RequestPage from './pages/RequestPage'

function HospitalLoginRoute() {
  const navigate = useNavigate()

  return (
    <HospitalLogin
      onLogin={() => navigate('/hospital/home')}
      onRegister={() => navigate('/hospital/register')}
    />
  )
}

function HospitalRegisterRoute() {
  const navigate = useNavigate()

  return <HospitalRegister onLogin={() => navigate('/hospital/login')} />
}

function HospitalHomeRoute() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('hospitalLoggedIn')
    navigate('/hospital/login')
  }

  return <HospitalHome onLogout={handleLogout} />
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <ScrollToTop />
          <ThemedToaster />
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="request" element={<RequestPage />} />
              <Route path="availability" element={<AvailabilityPage />} />
              <Route path="emergency" element={<EmergencyPage />} />
              <Route path="faq" element={<FaqPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>

            <Route path="/hospital" element={<Navigate to="/hospital/login" replace />} />
            <Route path="/hospital/login" element={<HospitalLoginRoute />} />
            <Route path="/hospital/register" element={<HospitalRegisterRoute />} />
            <Route path="/hospital/home" element={<HospitalHomeRoute />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  )
}
