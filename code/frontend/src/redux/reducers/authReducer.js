import { createSlice } from '@reduxjs/toolkit'
import { setNotification } from './notificationReducer'
import { signin, googleAuth, githubAuth, signOutUserFromDB, refreshUserToken, signup } from '../../services/auth'
import { toast } from 'react-toastify'


const initialState = {
  user: null,
  loading: false,
  tokenExpiry: null
  // _timestamp: null
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
      return { user: null, loading: false, tokenExpiry: null }
    },
    clearLoading(state) {
      return { ...state, loading: false }
    },
    updateTokenExpiry(state) {
      return { ...state, tokenExpiry: Date.now() + 15 * 60 * 1000 }
    },
    // updateTokenExpiry(state) {
    //   return { ...state, _timestamp: Date.now() }
    // },
  }
})

export const signupUser = (credentials, mode, redirect) => {
  return async dispatch => {
    dispatch(initial())
    try {
      const response = await signup(credentials, mode, redirect)
      if (mode === 'cli' && response.redirectUrl) {
        dispatch(clearLoading())
        return { success: true, redirectUrl: response.redirectUrl }
      }
      dispatch(setUser(response))
      dispatch(updateTokenExpiry())
      toast.success('Account created and logged in successfully')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || error.message
      dispatch(setNotification(message, 'failure'))
      dispatch(setError())
      return false
    }
  }
}

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
      dispatch(updateTokenExpiry())
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
      const response = await refreshUserToken()
      dispatch(setUser(response))
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
