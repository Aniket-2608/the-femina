import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem } from '../../types/index.js';

interface CartState {
  items: CartItem[];
  isCartDrawerOpen: boolean;
}

const loadStoredCart = (): CartItem[] => {
  try {
    const saved = localStorage.getItem('femina_cart_items');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const initialState: CartState = {
  items: loadStoredCart(),
  isCartDrawerOpen: false,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingIndex = state.items.findIndex(
        (i) => i.productId === action.payload.productId && i.variantId === action.payload.variantId
      );

      if (existingIndex > -1) {
        const newQty = state.items[existingIndex].quantity + action.payload.quantity;
        // Cap to available stock
        state.items[existingIndex].quantity = Math.min(newQty, action.payload.availableStock);
        state.items[existingIndex].subtotal =
          state.items[existingIndex].quantity * state.items[existingIndex].unitPrice;
      } else {
        state.items.push(action.payload);
      }

      localStorage.setItem('femina_cart_items', JSON.stringify(state.items));
      state.isCartDrawerOpen = true;
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; variantId: string; quantity: number }>
    ) => {
      const item = state.items.find(
        (i) => i.productId === action.payload.productId && i.variantId === action.payload.variantId
      );
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter(
            (i) => !(i.productId === action.payload.productId && i.variantId === action.payload.variantId)
          );
        } else {
          item.quantity = Math.min(action.payload.quantity, item.availableStock);
          item.subtotal = item.quantity * item.unitPrice;
        }
        localStorage.setItem('femina_cart_items', JSON.stringify(state.items));
      }
    },
    removeFromCart: (
      state,
      action: PayloadAction<{ productId: string; variantId: string }>
    ) => {
      state.items = state.items.filter(
        (i) => !(i.productId === action.payload.productId && i.variantId === action.payload.variantId)
      );
      localStorage.setItem('femina_cart_items', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('femina_cart_items');
    },
    openCartDrawer: (state) => {
      state.isCartDrawerOpen = true;
    },
    closeCartDrawer: (state) => {
      state.isCartDrawerOpen = false;
    },
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      localStorage.setItem('femina_cart_items', JSON.stringify(state.items));
    },
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  openCartDrawer,
  closeCartDrawer,
  setCartItems,
} = cartSlice.actions;

export default cartSlice.reducer;
