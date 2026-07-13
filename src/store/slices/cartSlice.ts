
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '@/config/constants';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  couponCode: string | null;
  couponDiscount: number;
}

// Load cart from localStorage
const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  
  const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
  if (!savedCart) return [];
  
  try {
    const parsed = JSON.parse(savedCart);
    // Filter out old hardcoded data that doesn't have MongoDB ObjectIds
    // MongoDB ObjectIds are 24 character hex strings
    return parsed.filter((item: CartItem) => item.id && item.id.length >= 24);
  } catch (e) {
    return [];
  }
};

// Save cart to localStorage
const saveCartToStorage = (cart: CartItem[]): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
};

const initialState: CartState = {
  items: loadCartFromStorage(),
  isOpen: false,
  couponCode: null,
  couponDiscount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const { id, size } = action.payload;
      const existingItem = state.items.find(item => item.id === id && item.size === size);
      
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      
      saveCartToStorage(state.items);
    },
    removeItem: (state, action: PayloadAction<{ id: string; size: string }>) => {
      const { id, size } = action.payload;
      state.items = state.items.filter(item => !(item.id === id && item.size === size));
      saveCartToStorage(state.items);
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; size: string; quantity: number }>) => {
      const { id, size, quantity } = action.payload;
      const item = state.items.find(item => item.id === id && item.size === size);
      
      if (item) {
        item.quantity = quantity;
      }
      
      saveCartToStorage(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      saveCartToStorage(state.items);
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    applyCoupon: (state, action: PayloadAction<{ code: string; discount: number }>) => {
      state.couponCode = action.payload.code;
      state.couponDiscount = action.payload.discount;
    },
    removeCoupon: (state) => {
      state.couponCode = null;
      state.couponDiscount = 0;
    },
  },
});

export const { 
  addItem, 
  removeItem, 
  updateQuantity, 
  clearCart, 
  toggleCart,
  applyCoupon,
  removeCoupon
} = cartSlice.actions;

export default cartSlice.reducer;
