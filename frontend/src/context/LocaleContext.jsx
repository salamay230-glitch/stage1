import { createContext, useContext, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLanguage, STORAGE_KEY } from '../features/locale/localeSlice';
import { translations } from '../i18n/translations';

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const dispatch = useDispatch();
  const locale = useSelector((state) => state.locale.language);

  const isRTL = locale === 'ar';

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [isRTL, locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale: (nextLocale) => dispatch(setLanguage(nextLocale)),
      isRTL,
      t: translations[locale],
    }),
    [dispatch, isRTL, locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return ctx;
}
