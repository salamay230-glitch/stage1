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

function mapAuthErrorToKey(error) {
  const status = error?.response?.status;

  if (status === 401 || status === 422) {
    return 'invalidCredentials';
  }

  if (status && status >= 500) {
    return 'loginFailed';
  }

  return 'unexpectedError';
}

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password, remember = true }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/login', { email, password, remember });
      const token = data?.token;
      const user = data?.user;

      if (!token || !user) {
        return rejectWithValue('unexpectedError');
      }

      persistAuth({ token, user, remember });
      return { token, user, remember };
    } catch (error) {
      return rejectWithValue(mapAuthErrorToKey(error));
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
        state.error = action.payload || 'unexpectedError';
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
