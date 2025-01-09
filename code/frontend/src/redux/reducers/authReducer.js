import { createSlice } from '@reduxjs/toolkit'
import { setNotification } from './notificationReducer'
import { signin, googleAuth, githubAuth } from '../../services/auth'
import { toast } from 'react-toastify'
import { signOutUserFromDB } from '../../services/user'


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
    }
  }
})

export const login = (credentials) => {
  return async dispatch => {
    dispatch(initial())
    try {
      const response = await signin(credentials)
      dispatch(setUser(response))
      toast.success('Logged in')
      return { success: true }
    } catch (error) {
      console.log(error)
      dispatch(setNotification(error.response.data.error, 'failure'))
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
      dispatch(setNotification(error.response.data.error, 'failure'))
      dispatch(setError())
      return false
    }
  }
}

export const googleLogin = () => {
  return async (dispatch) => {
    try {
      googleAuth()
      return true
    } catch (error) {
      dispatch(setNotification(error.message, 'failure'))
      dispatch(setError())
      return false
    }
  }
}

export const githubLogin = () => {
  return async (dispatch) => {
    try {
      githubAuth()
      return true
    } catch (error) {
      dispatch(setNotification(error.message, 'failure'))
      dispatch(setError())
      return false
    }
  }
}

export const { setUser, initial, setError, signOut } = authSlice.actions
export default authSlice.reducer