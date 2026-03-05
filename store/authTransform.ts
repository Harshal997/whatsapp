import { createTransform } from "redux-persist";
import { AuthState, initialState } from "./authSlice";

export const authTransform = createTransform(
  (inboundState: AuthState) => ({
    token: inboundState.token,
    user: inboundState.userData,
  }),
  (outboundState) => ({
    ...initialState,
    ...outboundState,
  }),
  { whitelist: ["auth"] },
);
