import MasterPasswordModal from '../components/Encryption/MasterPasswordModal'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setUser } from '../redux/reducers/authReducer'
import { me } from '../services/auth'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

const OAuthCallback = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(state => state.auth.user)
  const [searchParams] = useSearchParams()
  const [showMasterPasswordModal, setShowMasterPasswordModal] = useState(false)

  useEffect(() => {
    async function fetchUser() {
      try {
        if (!user) {
          const response = await me()
          dispatch(setUser(response))

          if (searchParams.get('genMasterPassword') === 'true') {
            setShowMasterPasswordModal(true)
          } else {
            toast.success('Logged in')
            navigate('/')
          }
        }
      } catch (error) {
        console.error(error)
        navigate('/signin')
      }
    }
    fetchUser()
  }, [dispatch, navigate, user, searchParams])

  return (
    <>
      <div className="container mx-auto p-4">
        <h1 className='text-2xl'>Finalizing your login. Please wait...</h1>
      </div>
      {user && (
        <MasterPasswordModal
          show={showMasterPasswordModal}
          onClose={() => {
            setShowMasterPasswordModal(false)
          }}
          email={user.email}
        />
      )}
    </>
  )
}

export default OAuthCallback
