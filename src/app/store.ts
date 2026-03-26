import { configureStore } from '@reduxjs/toolkit';
import promptReducer from '@/features/prompt/promptSlice';

export const store = configureStore({
  reducer: {
    prompt: promptReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
