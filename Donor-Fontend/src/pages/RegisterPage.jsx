import { ClipboardList } from "lucide-react";
import PageHeader from "../components/PageHeader";
import DonorRegistrationForm from "../components/DonorRegistrationForm";
import { useLanguage } from "../i18n/LanguageContext";

export default function RegisterPage() {
  const { t } = useLanguage();
  return (
    <div>
      <PageHeader
        title={t("register.page.title")}
        subtitle={t("register.page.subtitle")}
        icon={<ClipboardList className="w-8 h-8" />}
      />
      <DonorRegistrationForm />
    </div>
  );
}
