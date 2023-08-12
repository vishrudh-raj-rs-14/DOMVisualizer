import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : undefined,
};

export const counterSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      localStorage.setItem("user", JSON.stringify(action.payload));
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = undefined;
      localStorage.setItem("user", "");
    },
  },
});

export const { setUser, logout } = counterSlice.actions;

export default counterSlice.reducer;
