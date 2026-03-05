import { createSlice } from "@reduxjs/toolkit";

const chatsSlice = createSlice({
  name: "chats",
  initialState: {
    chats: {},
    userStarredMessages: {},
    privateKeys: {},
    loading: true,
  },
  reducers: {
    storeAllChats: (state, action) => {
      state.chats = action.payload.chats;
      state.privateKeys = action.payload.privateKeys;
      state.userStarredMessages = action.payload.starredMessages;
      state.loading = false;
    },
  },
});

export default chatsSlice.reducer;
export const { storeAllChats } = chatsSlice.actions;
