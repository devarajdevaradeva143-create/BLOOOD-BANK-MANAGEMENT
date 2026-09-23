import { Route, Routes } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import RegisterPage from "./pages/RegisterPage";
import EligibilityPage from "./pages/EligibilityPage";
import ProcessPage from "./pages/ProcessPage";
import BenefitsPage from "./pages/BenefitsPage";
import FaqPage from "./pages/FaqPage";
import ContactPage from "./pages/ContactPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="eligibility" element={<EligibilityPage />} />
        <Route path="process" element={<ProcessPage />} />
        <Route path="benefits" element={<BenefitsPage />} />
        <Route path="faq" element={<FaqPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
