import { CheckCircle2, Heart, RotateCcw } from "lucide-react";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { useLanguage } from "../i18n/LanguageContext";

const rows = [
  { labelKey: "register.success.donorName", key: "name", pill: null },
  {
    labelKey: "register.success.bloodGroup",
    key: "bloodGroup",
    pill: "red",
  },
  { labelKey: "register.success.district", key: "district", pill: null },
  { labelKey: "register.success.date", key: "date", pill: null },
  {
    labelKey: "register.success.status",
    key: "status",
    pill: "green",
    valueKey: "register.status.registered",
  },
];

export default function RegistrationSuccess({ donor, onRegisterAnother }) {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-2xl animate-slide-up py-8">
      <Card className="overflow-hidden rounded-2xl border p-0 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="bg-green-50 px-6 py-10 text-center dark:bg-emerald-950/40 sm:px-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-white dark:bg-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="mt-5 text-2xl font-bold text-green-900 dark:text-emerald-200">
            {t("register.success.title")}
          </h2>
          <p className="mt-2 text-green-700 dark:text-emerald-300">
            {t("register.success.subtitle")}
          </p>
        </div>

        <div className="px-6 py-8 sm:px-10">
          <div className="mb-6 rounded-xl border border-brand-200 bg-brand-50 px-4 py-4 text-center dark:border-brand-800 dark:bg-brand-900/30">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              {t("register.success.donorId")}
            </p>
            <p className="mt-1 font-mono text-lg font-bold text-brand-700 dark:text-brand-300">
              {donor.donorId}
            </p>
          </div>

          <dl>
            {rows.map((row) => {
              const value = row.valueKey ? t(row.valueKey) : donor[row.key];
              return (
                <div
                  key={row.key}
                  className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0 dark:border-slate-800"
                >
                  <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">
                    {t(row.labelKey)}
                  </dt>
                  <dd className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                    {row.pill === "red" ? (
                      <span className="inline-flex items-center rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white">
                        {value}
                      </span>
                    ) : row.pill === "green" ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {value}
                      </span>
                    ) : (
                      value
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>

        <div className="mx-6 mb-8 rounded-xl border border-brand-100 bg-brand-50 p-4 text-center dark:border-brand-900 dark:bg-brand-900/30 sm:mx-10">
          <Heart className="inline h-5 w-5 text-brand-600" />
          <p className="mt-1 text-sm font-medium text-brand-800 dark:text-brand-300">
            {t("register.success.thanks")}
          </p>
        </div>

        <div className="px-6 pb-8 sm:px-10">
          <Button
            variant="outline"
            onClick={onRegisterAnother}
            className="w-full dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:w-auto"
          >
            <RotateCcw className="h-4 w-4" />
            {t("register.success.registerAnother")}
          </Button>
        </div>
      </Card>

      <p className="mt-4 text-center text-xs text-gray-400 dark:text-slate-500">
        {t("register.success.demo")}
      </p>
    </div>
  );
}
