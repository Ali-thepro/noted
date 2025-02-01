import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../test-utils'
import SignUp from '../../src/pages/SignUp'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  http.post('/api/auth/signup', async ({ request }) => {
    const body = await request.json()
    if (
      body.email === 'newuser@test.com' &&
      body.password === 'password123' &&
      body.username === 'newuser'
    ) {
      return HttpResponse.json({
        id: '2',
        username: 'newuser',
        email: 'newuser@test.com',
        oauth: false,
        provider: 'local'
      })
    }
    return new HttpResponse(
      JSON.stringify({ error: 'Registration failed' }),
      { status: 400 }
    )
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('SignUp Component', () => {
  describe('Rendering', () => {
    it('renders all form elements correctly', () => {
      render(<SignUp />)

      expect(screen.getByPlaceholderText('Username')).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/name@company.com/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Confirm password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^sign up$/i })).toBeInTheDocument()
      expect(screen.getByText(/already have an account\?/i)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /^sign in$/i })).toBeInTheDocument()
    })

    it('includes OAuth component', () => {
      render(<SignUp />)

      expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in with github/i })).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('redirects to home when user is already authenticated', async () => {
      const { location } = render(<SignUp />, {
        preloadedState: {
          auth: {
            user: { id: '1', username: 'testuser', email: 'test@test.com' },
            loading: false
          }
        },
        path: '/signup',
        routeConfig: [
          { path: '/signup', element: <SignUp /> },
          { path: '/', element: <div>Home Page</div> }
        ]
      })

      await waitFor(() => {
        expect(location.pathname).toBe('/')
        expect(screen.getByText('Home Page')).toBeInTheDocument()
      })
    })

    it('redirects to signin page with CLI parameters', async () => {
      const { location } = render(<SignUp />, {
        path: '/signup?mode=cli&redirect=http://localhost:3000',
        routeConfig: [
          { path: '/signin', element: <div>Sign In Page</div> }
        ]
      })

      const signinLink = screen.getByRole('link', { name: /^sign in$/i })
      await userEvent.click(signinLink)

      await waitFor(() => {
        expect(location.pathname).toBe('/signin')
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
      const { store } = render(<SignUp />)

      const submitButton = screen.getByRole('button', { name: /^sign up$/i })
      await userEvent.click(submitButton)

      expect(store.getState().notification.message).toBe('All fields are required')
      expect(store.getState().notification.status).toBe('failure')
    })

    it('handles successful registration and redirects to home', async () => {
      const { store, location } = render(<SignUp />, {
        path: '/signup',
        routeConfig: [
          { path: '/signup', element: <SignUp /> },
          { path: '/', element: <div>Home Page</div> }
        ]
      })

      const usernameInput = screen.getByPlaceholderText('Username')
      const emailInput = screen.getByPlaceholderText(/name@company.com/i)
      const passwordInput = screen.getByPlaceholderText(/^Password$/i)
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm password')
      const submitButton = screen.getByRole('button', { name: /^sign up$/i })

      await userEvent.type(usernameInput, 'newuser')
      await userEvent.type(emailInput, 'newuser@test.com')
      await userEvent.type(passwordInput, 'password123')
      await userEvent.type(confirmPasswordInput, 'password123')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(store.getState().auth.user).toEqual({
          id: '2',
          username: 'newuser',
          email: 'newuser@test.com',
          oauth: false,
          provider: 'local'
        })
        expect(location.pathname).toBe('/')
        expect(screen.getByText('Home Page')).toBeInTheDocument()
      })
    })

    it('handles CLI mode registration correctly', async () => {
      const redirectUrl = 'http://localhost:3000/callback'
      server.use(
        http.post('/api/auth/signup', () => {
          return HttpResponse.json({ redirectUrl })
        })
      )

      const { store } = render(<SignUp />, {
        path: '/signup?mode=cli&redirect=http://localhost:3000/callback'
      })

      const usernameInput = screen.getByPlaceholderText('Username')
      const emailInput = screen.getByPlaceholderText(/name@company.com/i)
      const passwordInput = screen.getByPlaceholderText(/^Password$/i)
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm password')
      const submitButton = screen.getByRole('button', { name: /^sign up$/i })

      await userEvent.type(usernameInput, 'newuser')
      await userEvent.type(emailInput, 'newuser@test.com')
      await userEvent.type(passwordInput, 'password123')
      await userEvent.type(confirmPasswordInput, 'password123')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(store.getState().notification.message).toBe('Redirecting...')
        expect(store.getState().notification.status).toBe('success')
        expect(mockReplace).toHaveBeenCalledWith(redirectUrl)
      })
    })

    it('handles failed registration attempt', async () => {
      const { store } = render(<SignUp />)

      const usernameInput = screen.getByPlaceholderText('Username')
      const emailInput = screen.getByPlaceholderText(/name@company.com/i)
      const passwordInput = screen.getByPlaceholderText(/^Password$/i)
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm password')
      const submitButton = screen.getByRole('button', { name: /^sign up$/i })

      await userEvent.type(usernameInput, 'wronguser')
      await userEvent.type(emailInput, 'wrong@test.com')
      await userEvent.type(passwordInput, 'wrongpassword')
      await userEvent.type(confirmPasswordInput, 'wrongpassword')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(store.getState().auth.user).toBeNull()
        expect(store.getState().notification.message).toBe('Registration failed')
        expect(store.getState().notification.status).toBe('failure')
      })
    })
  })

  describe('Loading State', () => {
    it('shows loading spinner when submitting form', async () => {
      render(<SignUp />, {
        preloadedState: {
          auth: { loading: true }
        }
      })

      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /loading/i })).toBeDisabled()
    })
  })
})
