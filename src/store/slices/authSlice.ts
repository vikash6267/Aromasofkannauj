
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getUser, removeToken, removeUser, setToken, setUser } from '@/services/api';

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: getUser(),
  isAuthenticated: !!getUser(),
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: any; token: string }>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.error = null;
      
      // Save to localStorage
      setToken(action.payload.token);
      setUser(action.payload.user);
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    updateUser: (state, action: PayloadAction<any>) => {
      state.user = { ...state.user, ...action.payload };
      setUser(state.user);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      
      // Remove from localStorage
      removeToken();
      removeUser();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout,
  clearError,
  updateUser
} = authSlice.actions;

export default authSlice.reducer;
