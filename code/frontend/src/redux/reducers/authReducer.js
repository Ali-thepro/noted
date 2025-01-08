import { createSlice } from '@reduxjs/toolkit'
import { setNotification } from './notificationReducer'
import { signin } from '../../services/auth'
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



export const { setUser, initial, setError } = authSlice.actions
export default authSlice.reducer