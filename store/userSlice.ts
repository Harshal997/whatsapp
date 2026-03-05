import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userId: null,
    firstName: "",
    lastName: "",
    email: "",
  },
  reducers: {
    updateUser: (state, action) => {
      const { userId, firstName, lastName, email } = action.payload;
      state.userId = userId;
      state.email = email;
      state.firstName = firstName;
      state.lastName = lastName;
    },
  },
});

export default userSlice.reducer;
export const { updateUser } = userSlice.actions;
