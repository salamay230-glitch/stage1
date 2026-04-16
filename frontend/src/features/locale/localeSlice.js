import { createSlice } from '@reduxjs/toolkit';
import { translations } from '../../i18n/translations';

const STORAGE_KEY = 'app_locale';
const DEFAULT_LOCALE = 'ar';

function readInitialLocale() {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }

  const persistedLocale = window.localStorage.getItem(STORAGE_KEY);
  return persistedLocale && translations[persistedLocale] ? persistedLocale : DEFAULT_LOCALE;
}

const localeSlice = createSlice({
  name: 'locale',
  initialState: {
    language: readInitialLocale(),
  },
  reducers: {
    setLanguage(state, action) {
      state.language = translations[action.payload] ? action.payload : DEFAULT_LOCALE;
    },
  },
});

export const { setLanguage } = localeSlice.actions;
export { STORAGE_KEY };
export default localeSlice.reducer;
