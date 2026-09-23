import { MapPin } from "lucide-react";
import Card from "./ui/Card";
import Input from "./ui/Input";
import Select from "./ui/Select";
import { TN_DISTRICTS } from "../data/constants";
import { useLanguage } from "../i18n/LanguageContext";

const inputDark =
  "dark:[&_label]:text-slate-300 dark:[&_input]:bg-slate-800 dark:[&_input]:text-slate-100 dark:[&_input]:placeholder-slate-500";
const selectDark =
  "dark:[&_label]:text-slate-300 dark:[&_select]:bg-slate-800 dark:[&_select]:text-slate-100 dark:[&_select_option]:bg-slate-800 dark:[&_select_option]:text-slate-100";

export default function AddressInformation({ data, errors, onChange }) {
  const { t } = useLanguage();

  return (
    <Card className="rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-brand-50 p-2 dark:bg-brand-900/40">
          <MapPin className="h-5 w-5 text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            <span className="text-brand-600 dark:text-brand-400">2 · </span>
            {t("register.address.title")}
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {t("register.address.subtitle")}
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Select
          id="district"
          label={t("register.field.district")}
          required
          value={data.district}
          onChange={(v) => onChange("district", v)}
          options={TN_DISTRICTS}
          error={errors.district}
          placeholder={t("register.placeholder.district")}
          className={selectDark}
        />
        <Input
          id="city"
          label={t("register.field.city")}
          required
          value={data.city}
          onChange={(v) => onChange("city", v)}
          error={errors.city}
          placeholder={t("register.placeholder.city")}
          className={inputDark}
        />
        <Input
          id="pincode"
          label={t("register.field.pincode")}
          type="text"
          required
          value={data.pincode}
          onChange={(v) => onChange("pincode", v)}
          error={errors.pincode}
          placeholder={t("register.placeholder.pincode")}
          maxLength={6}
          inputMode="numeric"
          className={inputDark}
        />
        <div className="sm:col-span-2">
          <label
            htmlFor="address"
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300"
          >
            {t("register.field.address")}
            <span className="ml-0.5 text-brand-600" aria-hidden="true">
              *
            </span>
          </label>
          <textarea
            id="address"
            name="address"
            rows={3}
            value={data.address}
            onChange={(e) => onChange("address", e.target.value)}
            placeholder={t("register.placeholder.address")}
            required
            aria-invalid={errors.address ? "true" : undefined}
            aria-describedby={errors.address ? "address-error" : undefined}
            className={`block w-full rounded-lg border px-3.5 py-2.5 text-sm shadow-sm outline-none transition-colors focus:ring-2 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 ${
              errors.address
                ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:border-red-500 focus:ring-red-200 dark:border-slate-700"
            }`}
          />
          {errors.address && (
            <p
              id="address-error"
              role="alert"
              className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400"
            >
              {errors.address}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
