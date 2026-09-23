import { User } from "lucide-react";
import Card from "./ui/Card";
import Input from "./ui/Input";
import Select from "./ui/Select";
import { BLOOD_GROUPS, GENDERS } from "../data/constants";
import { useLanguage } from "../i18n/LanguageContext";

const inputDark =
  "dark:[&_label]:text-slate-300 dark:[&_input]:bg-slate-800 dark:[&_input]:text-slate-100 dark:[&_input]:placeholder-slate-500";
const selectDark =
  "dark:[&_label]:text-slate-300 dark:[&_select]:bg-slate-800 dark:[&_select]:text-slate-100 dark:[&_select_option]:bg-slate-800 dark:[&_select_option]:text-slate-100";

export default function PersonalInformation({ data, errors, onChange }) {
  const { t } = useLanguage();
  const genderOptions = GENDERS.map((g) =>
    t(`register.gender.${g.toLowerCase()}`)
  );

  return (
    <Card className="rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-brand-50 p-2 dark:bg-brand-900/40">
          <User className="h-5 w-5 text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            <span className="text-brand-600 dark:text-brand-400">1 · </span>
            {t("register.personal.title")}
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {t("register.personal.subtitle")}
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          id="fullName"
          label={t("register.field.fullName")}
          type="text"
          required
          value={data.fullName}
          onChange={(v) => onChange("fullName", v)}
          error={errors.fullName}
          placeholder={t("register.placeholder.fullName")}
          autoComplete="name"
          className={inputDark}
        />
        <Input
          id="dob"
          label={t("register.field.dob")}
          type="date"
          required
          value={data.dob}
          onChange={(v) => onChange("dob", v)}
          error={errors.dob}
          max={new Date().toISOString().split("T")[0]}
          className={inputDark}
        />
        <Input
          id="age"
          label={t("register.field.age")}
          type="text"
          value={data.age}
          onChange={() => {}}
          disabled
          readOnly
          placeholder={t("register.placeholder.age")}
          className={`${inputDark} dark:[&_input]:disabled:bg-slate-800 dark:[&_input]:disabled:text-slate-500`}
        />
        <Select
          id="gender"
          label={t("register.field.gender")}
          required
          value={data.gender}
          onChange={(v) => onChange("gender", v)}
          options={genderOptions}
          error={errors.gender}
          placeholder={t("register.placeholder.gender")}
          className={selectDark}
        />
        <Select
          id="bloodGroup"
          label={t("register.field.bloodGroup")}
          required
          value={data.bloodGroup}
          onChange={(v) => onChange("bloodGroup", v)}
          options={BLOOD_GROUPS}
          error={errors.bloodGroup}
          placeholder={t("register.placeholder.bloodGroup")}
          className={selectDark}
        />
        <Input
          id="mobile"
          label={t("register.field.mobile")}
          type="tel"
          required
          value={data.mobile}
          onChange={(v) => onChange("mobile", v)}
          error={errors.mobile}
          placeholder={t("register.placeholder.mobile")}
          maxLength={10}
          inputMode="numeric"
          autoComplete="tel"
          className={inputDark}
        />
        <Input
          id="email"
          label={t("register.field.email")}
          type="email"
          required
          value={data.email}
          onChange={(v) => onChange("email", v)}
          error={errors.email}
          placeholder={t("register.placeholder.email")}
          autoComplete="email"
          className={inputDark}
        />
      </div>
    </Card>
  );
}
