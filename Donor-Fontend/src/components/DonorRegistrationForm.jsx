import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import SectionHeading from "./ui/SectionHeading";
import Card from "./ui/Card";
import Input from "./ui/Input";
import Button from "./ui/Button";
import PersonalInformation from "./PersonalInformation";
import AddressInformation from "./AddressInformation";
import ConsentSection from "./ConsentSection";
import RegistrationSuccess from "./RegistrationSuccess";
import { EMPTY_CONSENTS, allConsentsChecked } from "../data/constants";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../i18n/LanguageContext";
import { requestOtp, registerDonor } from "../lib/api.js";

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

function normalizeGender(value) {
  const v = String(value ?? "").trim().toLowerCase();
  if (v === "male" || v === "ஆண்") return "Male";
  if (v === "female" || v === "பெண்") return "Female";
  if (v === "transgender" || v === "திருநர்") return "Transgender";
  if (v === "other") return "Other";
  return String(value ?? "").trim();
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
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");
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
    if (field === "mobile" && otpSent) {
      setOtpSent(false);
      setOtp("");
      setOtpError("");
    }
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

  const handleOtpChange = (value) => {
    const digitsOnly = String(value).replace(/\D/g, "").slice(0, 6);
    setOtp(digitsOnly);
    if (otpError) setOtpError("");
  };

  const buildPayload = () => {
    const payload = {
      fullName: formData.fullName.trim(),
      dob: formData.dob,
      gender: normalizeGender(formData.gender),
      bloodGroup: formData.bloodGroup,
      mobile: formData.mobile.trim(),
      district: formData.district,
      city: formData.city.trim(),
      pincode: formData.pincode.trim(),
      address: formData.address.trim(),
      consents: { ...consents },
    };
    const email = formData.email.trim();
    if (email) payload.email = email;
    const ageNum = Number(formData.age);
    if (formData.age !== "" && Number.isFinite(ageNum)) {
      payload.age = ageNum;
    } else {
      const calc = Number(calculateAge(formData.dob));
      if (Number.isFinite(calc) && calc >= 18 && calc <= 65) {
        payload.age = calc;
      }
    }
    return payload;
  };

  const focusFirstError = (validationErrors) => {
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
  };

  const handleSubmit = async () => {
    const validationErrors = validate(formData, t);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      focusFirstError(validationErrors);
      return;
    }

    if (!consentsOk) return;

    setIsSubmitting(true);
    setOtpError("");
    try {
      await requestOtp(formData.mobile.trim());
      setOtpSent(true);
      setOtp("");
      toast.success("OTP sent to your mobile number. Enter it below to complete registration.");
      document.getElementById("otp")?.focus();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send OTP. Please try again.";
      setOtpError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setOtpError("");
    try {
      await requestOtp(formData.mobile.trim());
      toast.success("OTP sent again to your mobile number.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to resend OTP. Please try again.";
      setOtpError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyAndRegister = async () => {
    const code = otp.trim();
    if (!/^\d{6}$/.test(code)) {
      const message = "Enter the 6-digit OTP sent to your mobile number.";
      setOtpError(message);
      document.getElementById("otp")?.focus();
      return;
    }

    setIsSubmitting(true);
    setOtpError("");
    try {
      const payload = buildPayload();
      const data = await registerDonor(payload, code);
      const serverDonor = data?.donor ?? data ?? {};
      const donorId = serverDonor.donorId;
      if (!donorId) {
        throw new Error("Registration succeeded but no donor ID was returned.");
      }
      setDonor({
        name: serverDonor.fullName || formData.fullName.trim(),
        bloodGroup: serverDonor.bloodGroup || formData.bloodGroup,
        district: serverDonor.district || formData.district,
        donorId,
        date: formatDate(new Date()),
        status: "Registered",
      });
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success(t("register.toast.success", { donorId }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setOtpError(message);
      toast.error(message);
      setIsSubmitting(false);
    }
  };

  const handleRegisterAnother = () => {
    setFormData(EMPTY_FORM);
    setErrors({});
    setConsents(EMPTY_CONSENTS);
    setDonor(null);
    setIsSubmitted(false);
    setOtp("");
    setOtpSent(false);
    setOtpError("");
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
              isSubmitting={isSubmitting && !otpSent}
            />

            {otpError && !otpSent ? (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
              >
                {otpError}
              </p>
            ) : null}

            {otpSent ? (
              <Card className="rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  Verify mobile number
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  We sent a 6-digit code to {formData.mobile.trim()}. Enter it
                  below to complete registration.
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                  <Input
                    id="otp"
                    label="OTP code"
                    type="text"
                    value={otp}
                    onChange={handleOtpChange}
                    error={otpError}
                    placeholder="6-digit OTP"
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                  />
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleVerifyAndRegister}
                      disabled={isSubmitting}
                      className="w-full sm:w-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify & Register"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResendOtp}
                      disabled={isSubmitting}
                      className="w-full sm:w-auto"
                    >
                      Resend OTP
                    </Button>
                  </div>
                </div>
              </Card>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
