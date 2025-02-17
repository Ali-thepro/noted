import { useState, useEffect } from 'react'
import { Button, Label, TextInput, Spinner } from 'flowbite-react'
import { useDispatch } from 'react-redux'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { setNotification } from '../redux/reducers/notificationReducer'
import { resetPassword } from '../services/auth'
import Notification from '../components/Notification'
import { toast } from 'react-toastify'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      navigate('/signin')
    }
  }, [token, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      dispatch(setNotification('Passwords do not match', 'failure'))
      return
    }

    setIsSubmitting(true)

    try {
      const response = await resetPassword(token, password, confirmPassword)
      toast.success(response.message)
      navigate('/signin')
    } catch (error) {
      const message = error.response?.data?.error || error.message
      dispatch(setNotification(message, 'failure'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen mt-20">
      <div className="flex p-3 max-w-md mx-auto flex-col md:flex-row md:items-center gap-12">
        <div className="flex-1">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <Label>New password</Label>
              <TextInput
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Confirm new password</Label>
              <TextInput
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="focus:ring-0 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 rounded-lg"
              outline
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner className="w-6 h-6" />
                  <span className="pl-3">Resetting...</span>
                </>
              ) : (
                <span>Reset Password</span>
              )}
            </Button>
          </form>
          <div className="flex gap-2 text-sm mt-5">
            <span>Remember your password?</span>
            <Link to="/signin" className="text-blue-500">
              Sign in
            </Link>
          </div>
          <Notification />
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
