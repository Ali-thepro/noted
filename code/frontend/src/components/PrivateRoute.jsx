import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { refreshToken } from '../redux/reducers/authReducer'
import UnlockModal from './Encryption/UnlockModal'
import memoryStore from './memoryStore'

const PrivateRoute = () => {
  const user = useSelector((state) => state.auth.user)
  const isSigningOut = useSelector((state) => state.auth.isSigningOut)
  const dispatch = useDispatch()
  const [isChecking, setIsChecking] = useState(true)
  const [showUnlock, setShowUnlock] = useState(false)
  const hasCheckedAuth = useRef(false)


  useEffect(() => {
    const checkAuth = async () => {
      if (hasCheckedAuth.current || isSigningOut) {
        setIsChecking(false)
        return
      }
      if (!user) {
        try {
          await dispatch(refreshToken())
        } catch (error) {
          if (!isSigningOut) {
            console.error('Token refresh failed:', error)
          }
        }
      }
      hasCheckedAuth.current = true
      setIsChecking(false)
    }
    checkAuth()
  }, [user, dispatch, isSigningOut])

  useEffect(() => {
    const checkEncryption = async () => {
      if (user) {
        try {
          if (!memoryStore.get()) {
            setShowUnlock(true)
          }
        } catch (error) {
          console.error('Failed to check encryption status:', error)
        }
      }
    }

    checkEncryption()
  }, [user])

  const containerStyle = {
    filter: showUnlock ? 'blur(10px)' : 'none',
    pointerEvents: showUnlock ? 'none' : 'auto',
  }

  if (isChecking) {
    return null
  }

  if (!user) {
    return <Navigate to="/signin" />
  }

  return (
    <>
      <div style={containerStyle}>
        <Outlet />
      </div>
      <UnlockModal
        show={showUnlock}
        onClose={() => setShowUnlock(false)}
        email={user.email}
      />
    </>
  )
}

export default PrivateRoute
