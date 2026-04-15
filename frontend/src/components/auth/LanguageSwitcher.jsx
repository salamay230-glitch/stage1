import { useLocale } from '../../context/LocaleContext';

const LANGUAGES = [
  { key: 'fr', labelKey: 'languageFrench' },
  { key: 'en', labelKey: 'languageEnglish' },
  { key: 'ar', labelKey: 'languageArabic' },
];

export default function LanguageSwitcher() {
  const { locale, setLocale, t, isRTL } = useLocale();

  return (
    <div className={`fixed bottom-5 z-20 flex items-center gap-3 ${isRTL ? 'right-6' : 'left-6'}`}>
      {LANGUAGES.map((language) => {
        const isActive = language.key === locale;
        return (
          <button
            type="button"
            key={language.key}
            onClick={() => setLocale(language.key)}
            className={`text-xs leading-4 transition-colors ${
              isActive
                ? 'font-medium italic text-emerald-400'
                : 'font-normal italic text-white/60 hover:text-white/80'
            }`}
            aria-pressed={isActive}
          >
            {t[language.labelKey]}
          </button>
        );
      })}
    </div>
  );
}
