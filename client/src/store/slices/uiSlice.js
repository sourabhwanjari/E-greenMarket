import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    toasts: []
  },
  reducers: {
    addToast: (state, action) => {
      const { message, type = 'success', duration = 3500 } = action.payload;
      state.toasts.push({
        id: Date.now() + Math.random(),
        message,
        type,
        duration
      });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    }
  }
});

export const { addToast, removeToast } = uiSlice.actions;
export default uiSlice.reducer;
