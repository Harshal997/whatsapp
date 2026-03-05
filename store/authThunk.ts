import { logout } from "./authSlice";
import { AppDispatch, persistor } from "./store";

export const logoutUser = () => {
  return async (dispatch: AppDispatch) => {
    dispatch(logout());
    await persistor.purge();
  };
};
