import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface UiState {
  isMobileMenuOpen: boolean;
  isSearchOverlayOpen: boolean;
  toasts: ToastNotification[];
}

const initialState: UiState = {
  isMobileMenuOpen: false,
  isSearchOverlayOpen: false,
  toasts: [],
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    closeMobileMenu: (state) => {
      state.isMobileMenuOpen = false;
    },
    toggleSearchOverlay: (state) => {
      state.isSearchOverlayOpen = !state.isSearchOverlayOpen;
    },
    closeSearchOverlay: (state) => {
      state.isSearchOverlayOpen = false;
    },
    addToast: (state, action: PayloadAction<Omit<ToastNotification, 'id'>>) => {
      const id = Date.now().toString();
      state.toasts.push({ id, ...action.payload });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const {
  toggleMobileMenu,
  closeMobileMenu,
  toggleSearchOverlay,
  closeSearchOverlay,
  addToast,
  removeToast,
} = uiSlice.actions;

export default uiSlice.reducer;
