import { FileCheck2, Loader2, UserPlus } from "lucide-react";
import Card from "./ui/Card";
import Button from "./ui/Button";
import Checkbox from "./ui/Checkbox";
import { CONSENT_ITEMS, allConsentsChecked } from "../data/constants";
import { useLanguage } from "../i18n/LanguageContext";

const checkboxDark =
  "dark:[&_label]:border-slate-800 dark:[&_label]:bg-slate-900 dark:[&_label]:hover:border-slate-700 dark:[&_label]:hover:bg-slate-800 dark:[&_label:has(:checked)]:border-brand-800 dark:[&_label:has(:checked)]:bg-brand-900/40 dark:[&_span]:text-slate-300";

export default function ConsentSection({
  value,
  onChange,
  onSubmit,
  disabled,
  isSubmitting = false,
}) {
  const { t } = useLanguage();
  const allChecked = allConsentsChecked(value);

  return (
    <Card className="rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-brand-50 p-2 dark:bg-brand-900/40">
          <FileCheck2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            <span className="text-brand-600 dark:text-brand-400">3 · </span>
            {t("register.consent.title")}
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {t("register.consent.subtitle")}
          </p>
        </div>
      </div>

      <fieldset className="mt-6">
        <legend className="sr-only">{t("register.consent.legend")}</legend>
        <div className="flex flex-col gap-3">
          {CONSENT_ITEMS.map((c) => (
            <Checkbox
              key={c.id}
              id={c.id}
              label={t(`register.consent.${c.id}`)}
              checked={value[c.id] === true}
              onChange={(checked) => onChange({ ...value, [c.id]: checked })}
              className={checkboxDark}
            />
          ))}
        </div>
      </fieldset>

      <div className="mt-6 border-t border-gray-100 pt-6 dark:border-slate-800">
        {disabled && !allChecked && (
          <p className="mb-4 text-sm text-gray-500 dark:text-slate-400">
            {t("register.consent.helper")}
          </p>
        )}
        <Button
          type="button"
          variant="primary"
          onClick={onSubmit}
          disabled={disabled}
          className="w-full sm:w-auto disabled:bg-gray-400 disabled:shadow-none dark:disabled:bg-slate-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("register.consent.submitting")}
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              {t("register.consent.submit")}
            </>
          )}
        </Button>
        <p className="mt-3 text-xs text-gray-400 dark:text-slate-500">
          {t("register.consent.demo")}
        </p>
      </div>
    </Card>
  );
}
