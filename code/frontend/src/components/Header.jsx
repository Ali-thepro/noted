import { Navbar } from 'flowbite-react'
import { Link, useLocation } from 'react-router-dom'

const Header = () => {
  const path = useLocation().pathname



  return (
    <Navbar className="border-b-2">
      <Navbar.Brand as={'div'}>
        <Link to="/" className="text-sm sm:text-xl font-semibold self-center whitespace-nowrap dark:text-white">
          <span className="px-2 py-1 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 rounded-lg text-white">Noted</span>
        </Link>
      </Navbar.Brand>
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