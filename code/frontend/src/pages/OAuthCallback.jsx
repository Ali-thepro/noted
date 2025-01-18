import { useDispatch, useSelector } from 'react-redux'
import { me } from '../services/auth'
import { setUser } from '../redux/reducers/authReducer'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'


const OAuthCallback = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(state => state.auth.user)
  useEffect(() => {
    async function fetchUser() {
      try {
        if (!user) {
          const response = await me()
          dispatch(setUser(response))
          toast.success('Logged in')
          navigate('/')
        }
      } catch (error) {
        console.error(error)
        navigate('/signin')
      }
    }
    fetchUser()
  }, [dispatch, navigate, user])

  return (
    <div className="container mx-auto p-4">
      <h1 className='text-3xl'>Finalizing your login. Please wait...</h1>
    </div>
  )
}

export default OAuthCallback
