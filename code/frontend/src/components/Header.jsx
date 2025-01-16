import { Navbar, Button, ButtonGroup } from 'flowbite-react'
import { Link, useLocation } from 'react-router-dom'
import { FaMoon, FaSun, FaColumns, FaPen, FaEye } from 'react-icons/fa'
import { useSelector, useDispatch } from 'react-redux'
import { setTheme } from '../redux/reducers/themeReducer'
import { setViewMode } from '../redux/reducers/noteReducer'
import { signOutUser } from '../redux/reducers/authReducer'
const Header = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const theme = useSelector(state => state.theme)
  const user = useSelector(state => state.auth.user)
  const viewMode = useSelector(state => state.note.viewMode)
  const isNotePage = location.pathname.startsWith('/demo')

  const changeTheme = () => {
    dispatch(setTheme())
  }

  const changeViewMode = (mode) => {
    dispatch(setViewMode(mode))
  }

  const handleSignOut = () => {
    dispatch(signOutUser())
  }

  return (
    <Navbar className="border-b-2">
      <div className="flex items-center gap-4">
        <Navbar.Brand as={'div'}>
          <Link to="/" className="text-sm sm:text-xl font-semibold self-center whitespace-nowrap dark:text-white">
            <span className="px-2 py-1 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 rounded-lg text-white">
              Noted
            </span>
          </Link>
        </Navbar.Brand>

        {isNotePage && (
          <ButtonGroup>
            <Button
              color="gray"
              size="sm"
              className="focus:ring-0"
              onClick={() => changeViewMode('edit')}
              gradientDuoTone={viewMode === 'edit' ? 'purpleToBlue' : undefined}
            >
              <FaPen />
            </Button>
            <Button
              color="gray"
              size="sm"
              className="focus:ring-0"
              onClick={() => changeViewMode('split')}
              gradientDuoTone={viewMode === 'split' ? 'purpleToBlue' : undefined}
            >
              <FaColumns />
            </Button>
            <Button
              color="gray"
              size="sm"
              className="focus:ring-0"
              onClick={() => changeViewMode('preview')}
              gradientDuoTone={viewMode === 'preview' ? 'purpleToBlue' : undefined}
            >
              <FaEye />
            </Button>
          </ButtonGroup>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          className="w-13 h-10 focus:ring-0"
          color='gray'
          pill
          onClick={changeTheme}
        >
          {theme === 'light' ? <FaMoon size='15'/> : <FaSun size='15'/>}
        </Button>

        {user ? (
          <Button
            className="focus:ring-0 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 rounded-lg"
            outline
            onClick={handleSignOut}
          >
            Logout
          </Button>
        ) : (
          <Link to="/signin">
            <Button className="focus:ring-0 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 rounded-lg" outline>
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </Navbar>
  )
}

export default Header