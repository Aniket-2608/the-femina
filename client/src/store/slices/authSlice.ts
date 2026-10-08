import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types/index.js';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register' | 'verify-email' | 'verify-phone';
  unverifiedEmail: string | null;
  unverifiedPhone: string | null;
  postAuthRedirectUrl: string | null;
}

const storedUser = localStorage.getItem('femina_user');
const storedToken = localStorage.getItem('femina_access_token');

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  accessToken: storedToken || null,
  isAuthenticated: Boolean(storedToken && storedUser),
  isAuthModalOpen: false,
  authModalTab: 'login',
  unverifiedEmail: null,
  unverifiedPhone: null,
  postAuthRedirectUrl: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string; refreshToken?: string }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      localStorage.setItem('femina_user', JSON.stringify(action.payload.user));
      localStorage.setItem('femina_access_token', action.payload.accessToken);
    },
    updateUserProfile: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem('femina_user', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('femina_user');
      localStorage.removeItem('femina_access_token');
    },
    openAuthModal: (
      state,
      action: PayloadAction<{ tab?: AuthState['authModalTab']; redirectUrl?: string } | undefined>
    ) => {
      state.isAuthModalOpen = true;
      if (action?.payload?.tab) state.authModalTab = action.payload.tab;
      if (action?.payload?.redirectUrl) state.postAuthRedirectUrl = action.payload.redirectUrl;
    },
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false;
    },
    setAuthModalTab: (state, action: PayloadAction<AuthState['authModalTab']>) => {
      state.authModalTab = action.payload;
    },
    setUnverifiedCredentials: (
      state,
      action: PayloadAction<{ email?: string; phone?: string }>
    ) => {
      if (action.payload.email) state.unverifiedEmail = action.payload.email;
      if (action.payload.phone) state.unverifiedPhone = action.payload.phone;
    },
    clearPostAuthRedirect: (state) => {
      state.postAuthRedirectUrl = null;
    },
  },
});

export const {
  setCredentials,
  updateUserProfile,
  logout,
  openAuthModal,
  closeAuthModal,
  setAuthModalTab,
  setUnverifiedCredentials,
  clearPostAuthRedirect,
} = authSlice.actions;

export default authSlice.reducer;
