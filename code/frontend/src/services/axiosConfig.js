import axios from 'axios'
import { refreshToken, signOut } from '../redux/reducers/authReducer'
import { toast } from 'react-toastify'

let dispatchFunction = null

export const setDispatch = (dispatch) => {
  dispatchFunction = dispatch
}

const axiosInstance = axios.create({
  withCredentials: true,
})

if (import.meta.env.MODE !== 'test') {
  let isRefreshing = false
  let failedQueue = []


  const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error)
      } else {
        prom.resolve(token)
      }
    })

    failedQueue = []
  }

  axiosInstance.interceptors.response.use(
    response => response,
    async (error) => {
      const originalRequest = error.config

      if (originalRequest.url?.includes('/refresh-token')) {
        // window.location.href = '/signin'
        toast.error('Session expired. Please sign in again.')
        dispatchFunction(signOut())
        return Promise.reject(error)
      }

      if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })

          .then(() => {
            return axiosInstance(originalRequest)
          })
          .catch(err => {
            return Promise.reject(err)
          })
      }
      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshed = await dispatchFunction(refreshToken())

        if (!refreshed) {
          return Promise.reject(error)
        }
        processQueue(null)
        return axiosInstance(originalRequest)
      } catch (err) {
        processQueue(err, null)
        dispatchFunction(signOut())
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
  )
}
export default axiosInstance
