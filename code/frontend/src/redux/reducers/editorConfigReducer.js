import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  mapping: 'default',
  indent: 'spaces',
  indentSize: 4,
  theme: 'One Dark',
  fontFamily: 'Fira Code',
  fontSize: 16
}

const editorConfigSlice = createSlice({
  name: 'editorConfig',
  initialState,
  reducers: {
    updateConfig: (state, action) => {
      return { ...state, ...action.payload }
    }
  }
})

export const { updateConfig } = editorConfigSlice.actions
export default editorConfigSlice.reducer
