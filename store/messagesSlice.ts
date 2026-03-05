import { createSlice } from "@reduxjs/toolkit";

const messagesSlice = createSlice({
  name: "messages",
  initialState: { messages: {}, loading: true },
  reducers: {
    storeAllMessages: (state, action) => {
      state.messages = action.payload.messages;
      state.loading = false;
    },
  },
});

export default messagesSlice.reducer;
export const { storeAllMessages } = messagesSlice.actions;
