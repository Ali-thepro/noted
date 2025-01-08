import { Navbar, Button } from 'flowbite-react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { setTheme } from '../redux/reducers/themeReducer'
import { FaMoon, FaSun } from 'react-icons/fa'

const Header = () => {
  const dispatch = useDispatch()
  const theme = useSelector(state => state.theme)
  const path = useLocation().pathname

  const changeTheme = () => {
    dispatch(setTheme())
  }



  return (
    <Navbar className="border-b-2">
      <Navbar.Brand as={'div'}>
        <Link to="/" className="text-sm sm:text-xl font-semibold self-center whitespace-nowrap dark:text-white">
          <span className="px-2 py-1 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 rounded-lg text-white">Noted</span>
        </Link>
      </Navbar.Brand>
      <div className="flex gap-2 md:order-2">
        <Button className="w-13 h-10 focus:ring-0" color='gray' pill onClick={changeTheme}>
          {theme === 'light' ? <FaMoon size='15'/> : <FaSun size='15'/>}
        </Button>

      </div>
      <Navbar.Collapse>
        <Navbar.Link active={path === '/'} as={Link} to='/'>
          Home
        </Navbar.Link>
        <Navbar.Link active={path === '/about'} as={Link} to='/about'>
          About
        </Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  )
}

export default Header