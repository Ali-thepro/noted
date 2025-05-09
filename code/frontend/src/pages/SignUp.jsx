import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Label, TextInput, Button, Spinner } from 'flowbite-react'
import { useState, useEffect } from 'react'
import { setNotification } from '../redux/reducers/notificationReducer'
import { useDispatch, useSelector } from 'react-redux'
import Notification from '../components/Notification'
import OAuth  from '../components/OAuth'
import { signupUser } from '../redux/reducers/authReducer'
import MasterPasswordModal from '../components/Encryption/MasterPasswordModal'
import { getMasterPasswordHash } from '../services/encryption'


const SignUp = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const loading = useSelector(state => state.auth.loading)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useSelector(state => state.auth.user)
  const [cliMode, setCliMode] = useState(false)
  const [mode, setMode] = useState(null)
  const [redirect, setRedirect] = useState(null)
  const [showMasterPasswordModal, setShowMasterPasswordModal] = useState(false)


  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const mode = searchParams.get('mode')
    const redirect = searchParams.get('redirect')
    let tmpCliMode = false

    if (mode) setMode(mode)
    if (redirect) setRedirect(redirect)
    if (mode === 'cli' && redirect) {
      setCliMode(true)
      tmpCliMode = true
    }

    if (!tmpCliMode && user) {
      setShowMasterPasswordModal(true)
    }

  }, [location, user, navigate])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value.trim() })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (formData.email === '' || formData.password === '' || formData.username === '' || formData.confirmPassword === '') {
      dispatch(setNotification('All fields are required', 'failure'))
      return
    }

    const result = await dispatch(signupUser(formData, mode, redirect))
    if (result.success && !cliMode) {
      setShowMasterPasswordModal(true)
    } else if (result.success && cliMode && result.redirectUrl) {
      dispatch(setNotification('Redirecting...', 'success'))
      window.location.replace(result.redirectUrl)
      return
    }
  }

  const handleMasterPasswordModalClose = async () => {
    const password = await getMasterPasswordHash()
    if (user && password) {
      setShowMasterPasswordModal(false)
      navigate('/')
    }
  }

  return (
    <>
      <div className="min-h-screen mt-20">
        <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-12">
          <div className="flex-1">
            <Link to="/" className="text-4xl font-bold dark:text-white">
              <span className="px-2 py-1 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 rounded-lg text-white">Noted</span>
            </Link>
            <p className="text-sm mt-5">
              This is a note app where you can store your notes and ideas. You can
              sign in with your email and password or with Google or GitHub.
            </p>

          </div>
          <div className="flex-1">
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="">
                <Label>Your username</Label>
                <TextInput
                  type="text"
                  placeholder="Username"
                  name="username"
                  onChange={handleChange}
                />
              </div>
              <div className="">
                <Label>Your email</Label>
                <TextInput
                  type="email"
                  placeholder="name@company.com"
                  name="email"
                  onChange={handleChange}
                />
              </div>
              <div className="">
                <Label>Your password</Label>
                <TextInput
                  type="password"
                  placeholder="Password"
                  name="password"
                  onChange={handleChange}
                />
              </div>
              <div className="">
                <Label>Confirm password</Label>
                <TextInput
                  type="password"
                  placeholder="Confirm password"
                  name="confirmPassword"
                  onChange={handleChange}
                />
              </div>
              <Button
                type="submit"
                className="focus:ring-0 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 rounded-lg" outline disabled={loading}>
                {loading ? (
                  <>
                    <Spinner className="w-6 h-6" />
                    <span className="pl-3">Loading...</span>
                  </>
                ) : (
                  <span>Sign up</span>
                )}
              </Button>
              <OAuth />
            </form>
            <div className="flex gap-2 text-sm mt-5">
              <span>Already have an account?</span>
              {
                cliMode ? (
                  <Link to={`/signin?mode=${mode}&redirect=${redirect}`} className="text-blue-500">
                    Sign in
                  </Link>
                ) : (
                  <Link to="/signin" className="text-blue-500">
                    Sign in
                  </Link>
                )
              }
            </div>
            {!showMasterPasswordModal && <Notification />}

          </div>
        </div>
      </div>

      <MasterPasswordModal
        show={showMasterPasswordModal}
        onClose={handleMasterPasswordModalClose}
        email={formData.email}
      />
    </>
  )
}

export default SignUp
