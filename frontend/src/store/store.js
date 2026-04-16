import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import localeReducer from '../features/locale/localeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    locale: localeReducer,
  },
});
