// ============================================================
// THEME SLICE — dark/light mode toggle
// This persists to localStorage so the preference survives refresh
// ============================================================

import { createSlice } from "@reduxjs/toolkit";

// Read saved preference on startup (gracefully handle SSR/no localStorage)
const getSavedTheme = () => {
  try {
    return localStorage.getItem("theme") || "light";
  } catch {
    return "light";
  }
};

type ThemeMode = "light" | "dark";

type ThemeState = {
  mode: ThemeMode;
};

const themeSlice = createSlice({
  name: "theme",
  initialState: { mode: getSavedTheme() },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
      try {
        localStorage.setItem("theme", state.mode);
      } catch {}
    },
    setTheme: (state, action) => {
      state.mode = action.payload;
      try {
        localStorage.setItem("theme", state.mode);
      } catch {}
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export const selectThemeMode = (state: { theme: ThemeState }) =>
  state.theme.mode;
export default themeSlice.reducer;
