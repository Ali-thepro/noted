import { useState } from 'react'
import { Button, Label, TextInput, Spinner } from 'flowbite-react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { setNotification } from '../redux/reducers/notificationReducer'
import { requestPasswordReset } from '../services/auth'
import Notification from '../components/Notification'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dispatch = useDispatch()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await requestPasswordReset(email)
      dispatch(setNotification(response.message, 'success'))
      setEmail('')
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
              <Label>Your email</Label>
              <TextInput
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  <span className="pl-3">Sending...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
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

export default ForgotPassword
