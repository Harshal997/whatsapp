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
      if (action.payload?.chats) {
        state.chats = action.payload.chats;
      }
      if (action.payload?.privateKeys) {
        state.privateKeys = action.payload.privateKeys;
      }
      if (action.payload?.starredMessages) {
        state.userStarredMessages = action.payload.starredMessages;
      }
      state.loading = false;
    },
  },
});

export default chatsSlice.reducer;
export const { storeAllChats } = chatsSlice.actions;
