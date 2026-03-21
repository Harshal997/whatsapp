import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    groupName: null,
    group: null,
    userId: null,
    firstName: "",
    lastName: "",
    email: "",
  },
  reducers: {
    updateUser: (state, action) => {
      const { userId, firstName, lastName, email, group } = action.payload;
      if (action.payload.group) {
        state.groupName = group.name;
        state.group = group;
        state.userId = null;
        state.email = "";
        state.firstName = "";
        state.lastName = "";
        return;
      }
      state.groupName = null;
      state.group = null;
      state.userId = userId;
      state.email = email;
      state.firstName = firstName;
      state.lastName = lastName;
    },
  },
});

export default userSlice.reducer;
export const { updateUser } = userSlice.actions;
