import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { clearPersistedAuth, persistAuth, readPersistedAuth } from '../../utils/authStorage';

const persistedSession = readPersistedAuth();

const initialState = {
  token: persistedSession?.token ?? null,
  user: persistedSession?.user ?? null,
  remember: persistedSession?.remember ?? false,
  status: 'idle',
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, remember = true }, { rejectWithValue }) => {
    try {
      // Prepared for Laravel API: replace fallback with API-only path when backend is ready.
      let token;
      let user;

      try {
        const { data } = await api.post('/login', { email, remember });
        token = data?.token;
        user = data?.user;
      } catch (requestError) {
        const status = requestError?.response?.status;
        if (status && status < 500) {
          throw requestError;
        }
      }

      if (!token || !user) {
        token = `demo-token-${Date.now()}`;
        user = { name: email.split('@')[0] || 'User', email };
      }

      persistAuth({ token, user, remember });
      return { token, user, remember };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || 'Unable to login. Please try again.',
      );
    }
  },
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  clearPersistedAuth();
  return true;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.remember = action.payload.remember;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message || 'Login failed.';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.remember = false;
        state.status = 'idle';
        state.error = null;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
