import { createSlice } from '@reduxjs/toolkit'
import { setNotification } from './notificationReducer'
import * as noteService from '../../services/note'
import { toast } from 'react-toastify'

const initialState = {
  notes: [],
  activeNote: null,
  total: 0,
  loading: false,
  viewMode: 'split' // 'preview', 'edit', 'split'
}

const noteSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setNotes(state, action) {
      state.notes = action.payload.notes
      state.total = action.payload.total
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
      const response = await noteService.getNotes(query)
      dispatch(setNotes(response))
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
      toast.success('Note created successfully')
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
      return updatedNote
    } catch (error) {
      let message

      if (error?.response?.data.includes('Tags cannot be more than 20 characters')) {
        message = 'Tags cannot be more than 20 characters'
      } else if (error?.response?.data.includes('Tags must be unique')) {
        message = 'Tags must be unique'
      } else {
        message = error.response?.data?.error || error.message
      }
      dispatch(setNotification(message, 'failure'))
      dispatch(setLoading(false))
      return null
    }
  }
}
export const deleteNote = (id, query) => {
  return async dispatch => {
    try {
      await noteService.deleteNote(id)
      dispatch(removeNote(id))
      dispatch(initializeNotes(query))
      toast.success('Note deleted successfully')
    } catch (error) {
      const message = error.response?.data?.error || error.message
      dispatch(setNotification(message, 'failure'))
      dispatch(setLoading(false))
    }
  }
}

export const { setNotes, setActiveNote, appendNote, updateNote, removeNote, setViewMode, setLoading } = noteSlice.actions
export default noteSlice.reducer
