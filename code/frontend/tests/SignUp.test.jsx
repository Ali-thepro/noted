import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from './test-utils'
import SignUp from '../src/pages/SignUp'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

// Mock Server Setup
const server = setupServer(
  http.post('/api/auth/signup', async ({ request }) => {
    const body = await request.json()
    // Successful registration condition
    if (
      body.email === 'newuser@test.com' &&
      body.password === 'password123' &&
      body.username === 'newuser'
    ) {
      return new HttpResponse(
        JSON.stringify({
          id: '2',
          username: 'newuser',
          email: 'newuser@test.com',
          oauth: false,
          provider: 'local'
        }),
        { status: 201 }
      )
    }
    // Failed registration condition
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
      expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/name@company.com/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument
    })

    it('includes OAuth component', () => {
        render(<SignUp />)
  
        expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /sign in with github/i })).toBeInTheDocument()
        expect(screen.getByText(/already have an account\?/i)).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument()
      })
  })
  describe('Navigation', () => {
    it('redirects to /signin after successful signup', async () => {
      const { location } = render(<SignUp />, {
        preloadedState: {
          auth: {
            user: null,
            loading: false
          }
        },
        path: '/signup',
        routeConfig: [
          { path: '/signup', element: <SignUp /> },
          { path: '/signin', element: <div>Sign In Page</div> }
        ]
      })

      // Fill out the form fields
      const usernameInput = screen.getByPlaceholderText('Username')
      const emailInput = screen.getByPlaceholderText(/name@company.com/i)
      const passwordInput = screen.getByPlaceholderText('Password')
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm password')
      const submitButton = screen.getByRole('button', { name: /sign up/i })

      await userEvent.type(usernameInput, 'newuser')
      await userEvent.type(emailInput, 'newuser@test.com')
      await userEvent.type(passwordInput, 'password123')
      await userEvent.type(confirmPasswordInput, 'password123')
      await userEvent.click(submitButton)

      // Wait for the navigation to /signin
      await waitFor(() => {
        expect(location.pathname).toBe('/signin')
        expect(screen.getByText('Sign In Page')).toBeInTheDocument()
      })
    })
    })
})
