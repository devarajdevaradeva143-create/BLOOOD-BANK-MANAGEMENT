import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
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
import RequestPage from './pages/RequestPage'

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
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  )
}
