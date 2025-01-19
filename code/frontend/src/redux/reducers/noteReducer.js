import { createSlice } from '@reduxjs/toolkit'
import { setNotification } from './notificationReducer'
import * as noteService from '../../services/note'

const initialState = {
  notes: [],
  activeNote: null,
  loading: false,
  viewMode: 'split' // 'preview', 'edit', 'split'
}

const noteSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setNotes(state, action) {
      state.notes = action.payload
      state.loading = false
    },
    setActiveNote(state, action) {
      state.activeNote = action.payload
      state.loading = false
    },
    appendNote(state, action) {
      state.notes.push(action.payload)
      state.loading = false
      state.activeNote = action.payload
    },
    updateNote(state, action) {
      const updatedNote = action.payload
      if (state.activeNote?.id === updatedNote.id) {
        state.activeNote = updatedNote
      }
      state.notes = state.notes.map(note =>
        note.id === updatedNote.id ? updatedNote : note
      )
      state.loading = false
    },
    removeNote(state, action) {
      state.notes = state.notes.filter(note => note.id !== action.payload)
      if (state.activeNote?.id === action.payload) {
        state.activeNote = null
      }
    },
    setViewMode(state, action) {
      state.viewMode = action.payload
    },
    setLoading(state, action) {
      state.loading = action.payload
    },
  }
})


export const initializeNotes = (query = '') => {
  return async dispatch => {
    dispatch(setLoading(true))
    try {
      const notes = await noteService.getNotes(query)
      dispatch(setNotes(notes))
    } catch (error) {
      const message = error.response?.data?.error || error.message
      dispatch(setNotification(message, 'failure'))
      dispatch(setLoading(false))
    }
  }
}

export const createNote = (noteData) => {
  return async dispatch => {
    dispatch(setLoading(true))
    try {
      const newNote = await noteService.createNote(noteData)
      dispatch(appendNote(newNote))
      dispatch(setNotification('Note created successfully', 'success'))
      return newNote
    } catch (error) {
      const message = error.response?.data?.error || error.message
      dispatch(setNotification(message, 'failure'))
      dispatch(setLoading(false))
      return null
    }
  }
}

export const fetchNote = (id) => {
  return async dispatch => {
    dispatch(setLoading(true))
    try {
      const note = await noteService.getNote(id)
      dispatch(setActiveNote(note))
    } catch (error) {
      const message = error.response?.data?.error || error.message
      dispatch(setNotification(message, 'failure'))
      dispatch(setLoading(false))
    }
  }
}

export const editNote = (id, noteData) => {
  return async dispatch => {
    dispatch(setLoading(true))
    try {
      const updatedNote = await noteService.updateNote(id, noteData)
      dispatch(updateNote(updatedNote))
      dispatch(setNotification('Note saved successfully', 'success'))
    } catch (error) {
      const message = error.response?.data?.error || error.message
      dispatch(setNotification(message, 'failure'))
      dispatch(setLoading(false))
    }
  }
}

export const deleteNote = (id) => {
  return async dispatch => {
    try {
      await noteService.deleteNote(id)
      dispatch(removeNote(id))
      dispatch(setNotification('Note deleted successfully', 'success'))
    } catch (error) {
      const message = error.response?.data?.error || error.message
      dispatch(setNotification(message, 'failure'))
      dispatch(setLoading(false))
    }
  }
}

export const { setNotes, setActiveNote, appendNote, updateNote, removeNote, setViewMode, setLoading } = noteSlice.actions
export default noteSlice.reducer
