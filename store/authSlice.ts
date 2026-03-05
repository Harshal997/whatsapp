import { createSlice } from "@reduxjs/toolkit";

export interface AuthState {
  token: string | null;
  tokenExpiryDate: string | null;
  userData: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export const initialState: AuthState = {
  token: null,
  tokenExpiryDate: null,
  userData: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    authenticate: (state, action) => {
      const { payload } = action;
      state.token = payload.token;
      state.tokenExpiryDate = payload.tokenExpiryDate;
      state.userData = payload.userData;
    },
    save: (state, action) => {
      const { payload } = action;
      console.log("payload", payload);
      state.userData = payload;
    },
    logout: () => initialState,
  },
});

export const { authenticate, logout, save } = authSlice.actions;
export default authSlice.reducer;
