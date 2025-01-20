import { createSlice } from '@reduxjs/toolkit'
import { setNotification } from './notificationReducer'
import { signin, googleAuth, githubAuth, signOutUserFromDB, refreshUserToken } from '../../services/auth'
import { toast } from 'react-toastify'


const initialState = {
  user: null,
  loading: false,
}
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(_state, action) {
      return { user: action.payload, loading: false }
    },
    initial(state) {
      return { ...state, loading: true }
    },
    setError(state) {
      return { ...state,  loading: false }
    },
    signOut() {
      return { user: null, loading: false }
    },
    clearLoading(state) {
      return { ...state, loading: false }
    },
    updateTokenExpiry(state) {
      return { ...state, tokenExpiry: Date.now() + (15 * 60 * 1000) }
    }
  }
})

export const login = (credentials, mode, redirect) => {
  return async dispatch => {
    dispatch(initial())
    try {
      const response = await signin(credentials, mode, redirect)
      if (mode === 'cli' && response.redirectUrl) {
        dispatch(clearLoading())
        return { success: true, redirectUrl: response.redirectUrl }
      }
      dispatch(setUser(response))
      toast.success('Logged in')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || error.message
      dispatch(setNotification(message, 'failure'))
      dispatch(setError())
      return false
    }
  }
}

export const refreshToken = () => {
  return async dispatch => {
    try {
      await refreshUserToken()
      dispatch(updateTokenExpiry())
      return true
    } catch (error) {
      const message = error.response?.data?.error || error.message
      dispatch(setNotification(message, 'failure'))
      dispatch(setError())
      return false
    }
  }
}

export const signOutUser = () => {
  return async dispatch => {
    dispatch(initial())
    try {
      await signOutUserFromDB()
      dispatch(signOut())
      toast.success('User signed out sucessfully')
      return true
    } catch (error) {
      const message = error.response?.data?.error || error.message
      dispatch(setNotification(message, 'failure'))
      dispatch(setError())
      return false
    }
  }
}

export const googleLogin = (mode, redirect) => {
  return async (dispatch) => {
    try {
      googleAuth(mode, redirect)
      return true
    } catch (error) {
      const message = error.response?.data?.error || error.message
      dispatch(setNotification(message, 'failure'))
      dispatch(setError())
      return false
    }
  }
}

export const githubLogin = (mode, redirect) => {
  return async (dispatch) => {
    try {
      githubAuth(mode, redirect)
      return true
    } catch (error) {
      const message = error.response?.data?.error || error.message
      dispatch(setNotification(message, 'failure'))
      dispatch(setError())
      return false
    }
  }
}

export const { setUser, initial, setError, signOut, clearLoading, updateTokenExpiry } = authSlice.actions
export default authSlice.reducer
