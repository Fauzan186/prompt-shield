import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { sanitizePrompt } from './promptUtils';
import type { DetectedItem, SanitizeMode } from '@/types/prompt';

interface PromptState {
  inputText: string;
  sanitizedText: string;
  detectedItems: DetectedItem[];
  mode: SanitizeMode;
}

const initialState: PromptState = {
  inputText: '',
  sanitizedText: '',
  detectedItems: [],
  mode: 'replace',
};

const promptSlice = createSlice({
  name: 'prompt',
  initialState,
  reducers: {
    setInputText(state, action: PayloadAction<string>) {
      state.inputText = action.payload;
    },
    setMode(state, action: PayloadAction<SanitizeMode>) {
      state.mode = action.payload;
    },
    scanAndSanitize(state) {
      const result = sanitizePrompt(state.inputText, state.mode);
      state.sanitizedText = result.sanitizedText;
      state.detectedItems = result.detectedItems;
    },
    clearPrompt(state) {
      state.inputText = '';
      state.sanitizedText = '';
      state.detectedItems = [];
    },
  },
});

export const { clearPrompt, scanAndSanitize, setInputText, setMode } = promptSlice.actions;
export default promptSlice.reducer;
