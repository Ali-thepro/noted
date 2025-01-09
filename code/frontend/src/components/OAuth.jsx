import { Button } from 'flowbite-react'
import { AiFillGoogleCircle } from 'react-icons/ai'
import { FaGithub } from 'react-icons/fa'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { googleLogin, githubLogin } from '../redux/reducers/authReducer'

const OAuth = () => {
  const location = useLocation()
  const dispatch = useDispatch()
  const [mode, setMode] = useState(null)
  const [redirect, setRedirect] = useState(null)

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const mode = searchParams.get('mode')
    const redirect = searchParams.get('redirect')
    if (mode === 'cli' && redirect) {
      setMode(mode)
      setRedirect(redirect)
    }

  }, [location])

  const handleGoogleAuth = () => {
    dispatch(googleLogin(mode, redirect))
  }

  const handleGitHubAuth = () => {
    dispatch(githubLogin(mode, redirect))
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        outline
        className="bg-blue-500 focus:ring-0"
        onClick={handleGoogleAuth}
      >
        <AiFillGoogleCircle className="w-5 h-5 mr-2" />
        Sign in with Google
      </Button>

      <Button
        outline
        className="bg-gradient-to-r from-gray-600 to-black focus:ring-0"
        onClick={handleGitHubAuth}
      >
        <FaGithub className="w-5 h-5 mr-2" />
        Sign in with GitHub
      </Button>
    </div>
  )

}

export default OAuth