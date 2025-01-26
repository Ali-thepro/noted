import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from './test-utils'
import SignIn from '../src/pages/SignIn'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  http.post('/api/auth/signin', async ({ request }) => {
    const body = await request.json()
    if (body.email === 'test@test.com' && body.password === 'password123') {
      return HttpResponse.json({
        id: '1',
        username: 'testuser',
        email: 'test@test.com',
        oauth: false,
        provider: 'local'
      })
    }
    return new HttpResponse(
      JSON.stringify({ error: 'Invalid credentials' }),
      { status: 401 }
    )
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('SignIn Component', () => {
  describe('Rendering', () => {
    it('renders all form elements correctly', () => {
      render(<SignIn />)

      expect(screen.getByPlaceholderText(/name@company.com/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument()
      expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /^sign up$/i })).toBeInTheDocument()
    })

    it('includes OAuth component', () => {
      render(<SignIn />)

      expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in with github/i })).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('redirects to home when user is already authenticated', async () => {
      const { location } = render(<SignIn />, {
        preloadedState: {
          auth: {
            user: { id: '1', username: 'testuser', email: 'test@test.com' },
            loading: false
          }
        },
        path: '/signin',
        routeConfig: [
          { path: '/signin', element: <SignIn /> },
          { path: '/', element: <div>Home Page</div> }
        ]
      })
      
      await waitFor(() => {
        expect(location.pathname).toBe('/')
        expect(screen.getByText('Home Page')).toBeInTheDocument()
      })
    })

    it('redirects to signup page with CLI parameters', async () => {
      const { location } = render(<SignIn />, {
        path: '/signin?mode=cli&redirect=http://localhost:3000',
        routeConfig: [
          { path: '/signup', element: <div>Sign Up Page</div> }
        ]
      })

      const signupLink = screen.getByRole('link', { name: /^sign up$/i })
      await userEvent.click(signupLink)

      await waitFor(() => {
        expect(location.pathname).toBe('/signup')
        expect(location.search).toBe('?mode=cli&redirect=http://localhost:3000')
      })
    })
  })


  describe('Form Submission', () => {
    const mockReplace = vi.fn()

    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        value: {
          ...window.location,
          replace: mockReplace
        },
        writable: true
      })
    })

    afterEach(() => {
      mockReplace.mockClear()
    })

    it('shows error when submitting empty form', async () => {
      const { store } = render(<SignIn />)

      const submitButton = screen.getByRole('button', { name: /^sign in$/i })
      await userEvent.click(submitButton)

      expect(store.getState().notification.message).toBe('Email and password are required')
      expect(store.getState().notification.status).toBe('failure')
    })

    it('handles successful login and redirects to home', async () => {
      const { store, location } = render(<SignIn />, {
        path: '/signin',
        routeConfig: [
          { path: '/signin', element: <SignIn /> },
          { path: '/', element: <div>Home Page</div> }
        ]
      })

      const emailInput = screen.getByPlaceholderText(/name@company.com/i)
      const passwordInput = screen.getByPlaceholderText(/password/i)
      const submitButton = screen.getByRole('button', { name: /^sign in$/i })

      expect(location.pathname).toBe('/signin')

      await userEvent.type(emailInput, 'test@test.com')
      await userEvent.type(passwordInput, 'password123')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(store.getState().auth.user).toEqual({
          id: '1',
          username: 'testuser',
          email: 'test@test.com',
          oauth: false,
          provider: 'local'
        })
        expect(location.pathname).toBe('/')
        expect(screen.getByText('Home Page')).toBeInTheDocument()
      })
    })

    it('handles CLI mode login correctly', async () => {
      const redirectUrl = 'http://localhost:3000/callback'
      server.use(
        http.post('/api/auth/signin', () => {
          return HttpResponse.json({ redirectUrl })
        })
      )

      const { store } = render(<SignIn />, {
        path: '/signin?mode=cli&redirect=http://localhost:3000/callback'
      })

      const emailInput = screen.getByPlaceholderText(/name@company.com/i)
      const passwordInput = screen.getByPlaceholderText(/password/i)
      const submitButton = screen.getByRole('button', { name: /^sign in$/i })

      await userEvent.type(emailInput, 'test@test.com')
      await userEvent.type(passwordInput, 'password123')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(store.getState().notification.message).toBe('Redirecting...')
        expect(store.getState().notification.status).toBe('success')
        expect(mockReplace).toHaveBeenCalledWith(redirectUrl)
      })
    })

    it('handles failed login attempt', async () => {
      const { store } = render(<SignIn />)

      const emailInput = screen.getByPlaceholderText(/name@company.com/i)
      const passwordInput = screen.getByPlaceholderText(/password/i)
      const submitButton = screen.getByRole('button', { name: /^sign in$/i })

      await userEvent.type(emailInput, 'wrong@test.com')
      await userEvent.type(passwordInput, 'wrongpassword')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(store.getState().auth.user).toBeNull()
        expect(store.getState().notification.message).toBe('Invalid credentials')
        expect(store.getState().notification.status).toBe('failure')
      })
    })
  })

  describe('Loading State', () => {
    it('shows loading spinner when submitting form', async () => {
      render(<SignIn />, {
        preloadedState: {
          auth: { loading: true }
        }
      })

      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.getByRole('status')).toBeInTheDocument() // spinner
      expect(screen.getByRole('button', { name: /loading/i })).toBeDisabled()
    })
  })
})
