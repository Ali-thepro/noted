import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { refreshToken } from '../redux/reducers/authReducer'

const PrivateRoute = () => {
  const user = useSelector((state) => state.auth.user)
  const dispatch = useDispatch()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      if (!user) {
        try {
          await dispatch(refreshToken())
        } catch (error) {
          console.error('Token refresh failed:', error)
        }
      }
      setIsChecking(false)
    }

    checkAuth()
  }, [user, dispatch])

  if (isChecking) {
    return null
  }

  return user ? <Outlet /> : <Navigate to="/signin" />
}

export default PrivateRoute
