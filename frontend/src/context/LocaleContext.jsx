import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const LocaleContext = createContext(null);

const STORAGE_KEY = 'app_locale';

const messages = {
  en: {
    brand: 'OCP',
    loginTitle: 'Connexion',
    loginSubtitle: 'Enter the email associated with your Revolut Business account',
    emailPlaceholder: 'Email ID',
    passwordPlaceholder: 'Password',
    show: 'Show',
    hide: 'Hide',
    login: 'Login',
    loading: 'Loading',
    qrTitle: 'Log in with QR code',
    qrDescription: 'Scan this code with your phone camera to log in instantly',
    qrExpired: 'QR code expired',
    refresh: 'Refresh',
    hello: 'Hello',
    logout: 'Log out',
    languageEnglish: 'English',
    languageFrench: 'Français',
    languageArabic: 'العربية',
  },
  fr: {
    brand: 'OCP',
    loginTitle: 'Connexion',
    loginSubtitle: 'Saisissez l’email associe a votre compte Revolut Business',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Mot de passe',
    show: 'Afficher',
    hide: 'Masquer',
    login: 'Connexion',
    loading: 'Chargement',
    qrTitle: 'Connexion avec QR code',
    qrDescription: 'Scannez ce code avec votre telephone pour vous connecter',
    qrExpired: 'QR code expire',
    refresh: 'Actualiser',
    hello: 'Bonjour',
    logout: 'Se deconnecter',
    languageEnglish: 'English',
    languageFrench: 'Français',
    languageArabic: 'العربية',
  },
  ar: {
    brand: 'OCP',
    loginTitle: 'تسجيل الدخول',
    loginSubtitle: 'ادخل البريد الالكتروني المرتبط بحسابك',
    emailPlaceholder: 'البريد الالكتروني',
    passwordPlaceholder: 'كلمة المرور',
    show: 'اظهار',
    hide: 'اخفاء',
    login: 'دخول',
    loading: 'جار التحميل',
    qrTitle: 'تسجيل الدخول عبر QR',
    qrDescription: 'امسح هذا الرمز بهاتفك للدخول فورا',
    qrExpired: 'انتهت صلاحية الرمز',
    refresh: 'تحديث',
    hello: 'مرحبا',
    logout: 'تسجيل الخروج',
    languageEnglish: 'English',
    languageFrench: 'Français',
    languageArabic: 'العربية',
  },
};

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    const persisted = window.localStorage.getItem(STORAGE_KEY);
    return persisted && messages[persisted] ? persisted : 'en';
  });

  const isRTL = locale === 'ar';

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [isRTL, locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      isRTL,
      t: messages[locale],
    }),
    [isRTL, locale],
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
