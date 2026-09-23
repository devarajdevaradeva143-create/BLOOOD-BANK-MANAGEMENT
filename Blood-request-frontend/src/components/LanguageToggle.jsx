import { useLanguage } from '../context/useLanguage'

const options = [
  { value: 'en', label: 'English' },
  { value: 'ta', label: 'தமிழ்' },
]

export default function LanguageToggle() {
  const { lang, setLang, t } = useLanguage()

  return (
    <div
      role="group"
      aria-label={t('app.langLabel')}
      className="flex rounded-full border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900"
    >
      {options.map((opt) => {
        const active = lang === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            aria-label={t('app.langLabel')}
            onClick={() => setLang(opt.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition duration-200 focus-visible:ring-2 focus-visible:ring-red-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950 sm:text-sm ${
              active
                ? 'bg-red-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
