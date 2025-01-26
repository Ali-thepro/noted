import { screen } from '@testing-library/react'
import { render } from './test-utils'
import NotFound from '../src/pages/NotFound'
import Home from '../src/pages/Home'

describe('NotFound Component', () => {
  describe('Rendering', () => {
    it('renders 404 page elements correctly', () => {
      render(<NotFound />)

      expect(screen.getByText('404')).toBeInTheDocument()
      expect(screen.getByText('Page not found')).toBeInTheDocument()
    })
  })

  describe('Routing', () => {
    it('shows NotFound when accessing an unregistered route', () => {
      render(<NotFound />, {
        path: '/non-existent-route',
        routeConfig: [
          { path: '/', element: <Home /> }
        ]
      })

      expect(screen.getByText('404')).toBeInTheDocument()
      expect(screen.getByText('Page not found')).toBeInTheDocument()
    })

    it('does not show NotFound for registered routes', () => {
      const { location } = render(<Home />, {
        path: '/',
        routeConfig: [
          { path: '/', element: <Home /> },
          { path: '*', element: <NotFound /> }
        ]
      })

      expect(screen.queryByText('404')).not.toBeInTheDocument()
      expect(screen.queryByText('Page not found')).not.toBeInTheDocument()
      expect(location.pathname).toBe('/')
    })
  })
})
