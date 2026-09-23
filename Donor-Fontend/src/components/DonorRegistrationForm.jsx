import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import SectionHeading from "./ui/SectionHeading";
import PersonalInformation from "./PersonalInformation";
import AddressInformation from "./AddressInformation";
import ConsentSection from "./ConsentSection";
import RegistrationSuccess from "./RegistrationSuccess";
import { EMPTY_CONSENTS, allConsentsChecked } from "../data/constants";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../i18n/LanguageContext";

const EMPTY_FORM = {
  fullName: "",
  dob: "",
  age: "",
  gender: "",
  bloodGroup: "",
  mobile: "",
  email: "",
  district: "",
  city: "",
  pincode: "",
  address: "",
};

function calculateAge(dob) {
  if (!dob) return "";
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return "";
  const today = new Date();
  if (birth > today) return "";
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birth.getDate())
  ) {
    age -= 1;
  }
  return String(age);
}

function validate(data, t) {
  const errors = {};

  if (!data.fullName.trim()) {
    errors.fullName = t("register.err.nameRequired");
  } else if (data.fullName.trim().length < 3) {
    errors.fullName = t("register.err.nameShort");
  }

  if (!data.dob) {
    errors.dob = t("register.err.dobRequired");
  } else {
    const ageNum = Number(calculateAge(data.dob));
    if (Number.isNaN(ageNum)) {
      errors.dob = t("register.err.dobInvalid");
    } else if (ageNum < 18 || ageNum > 65) {
      errors.dob = t("register.err.dobAgeRange");
    }
  }

  if (!data.gender) errors.gender = t("register.err.genderRequired");
  if (!data.bloodGroup) errors.bloodGroup = t("register.err.bloodGroupRequired");

  if (!data.mobile.trim()) {
    errors.mobile = t("register.err.mobileRequired");
  } else if (!/^[6-9]\d{9}$/.test(data.mobile.trim())) {
    errors.mobile = t("register.err.mobileInvalid");
  }

  if (!data.email.trim()) {
    errors.email = t("register.err.emailRequired");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = t("register.err.emailInvalid");
  }

  if (!data.district) errors.district = t("register.err.districtRequired");
  if (!data.city.trim()) errors.city = t("register.err.cityRequired");

  if (!data.pincode.trim()) {
    errors.pincode = t("register.err.pincodeRequired");
  } else if (!/^\d{6}$/.test(data.pincode.trim())) {
    errors.pincode = t("register.err.pincodeInvalid");
  }

  if (!data.address.trim()) {
    errors.address = t("register.err.addressRequired");
  } else if (data.address.trim().length < 10) {
    errors.address = t("register.err.addressShort");
  }

  return errors;
}

function formatDate(date) {
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DonorRegistrationForm() {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [consents, setConsents] = useState(EMPTY_CONSENTS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [donor, setDonor] = useState(null);
  const formRef = useRef(null);
  const toastCtx = useToast();
  const toast = toastCtx.toast ?? toastCtx;
  const { t } = useLanguage();

  const consentsOk = allConsentsChecked(consents);
  const registerDisabled = !consentsOk || isSubmitting;

  const handlePersonalField = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "dob") {
        next.age = calculateAge(value);
      }
      return next;
    });
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleAddressField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = () => {
    const validationErrors = validate(formData, t);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstErrorId = [
        "fullName",
        "dob",
        "gender",
        "bloodGroup",
        "mobile",
        "email",
        "district",
        "city",
        "pincode",
        "address",
      ].find((id) => validationErrors[id]);
      document.getElementById(firstErrorId)?.focus();
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (!consentsOk) return;

    setIsSubmitting(true);
    window.setTimeout(() => {
      const now = new Date();
      const donorId = `BBMS-DNR-${now.getFullYear()}${String(
        now.getMonth() + 1
      ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(
        Math.floor(1000 + Math.random() * 9000)
      )}`;

      setDonor({
        name: formData.fullName.trim(),
        bloodGroup: formData.bloodGroup,
        district: formData.district,
        donorId,
        date: formatDate(now),
        status: "Registered",
      });
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success(t("register.toast.success", { donorId }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 600);
  };

  const handleRegisterAnother = () => {
    setFormData(EMPTY_FORM);
    setErrors({});
    setConsents(EMPTY_CONSENTS);
    setDonor(null);
    setIsSubmitted(false);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="py-16 md:py-24">
      <div ref={formRef} className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={t("register.form.title")}
          subtitle={t("register.form.subtitle")}
          centered
        />

        {isSubmitted && donor ? (
          <RegistrationSuccess
            donor={donor}
            onRegisterAnother={handleRegisterAnother}
          />
        ) : (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-blue-900 dark:bg-blue-950/40">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-200">
                    {t("register.callout.title")}
                  </p>
                  <p className="mt-0.5 text-sm text-blue-700 dark:text-blue-300">
                    {t("register.callout.text")}
                  </p>
                </div>
              </div>
              <Link
                to="/eligibility"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
              >
                {t("register.callout.cta")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <PersonalInformation
              data={formData}
              errors={errors}
              onChange={handlePersonalField}
            />
            <AddressInformation
              data={formData}
              errors={errors}
              onChange={handleAddressField}
            />
            <ConsentSection
              value={consents}
              onChange={setConsents}
              onSubmit={handleSubmit}
              disabled={registerDisabled}
              isSubmitting={isSubmitting}
            />
          </div>
        )}
      </div>
    </section>
  );
}
