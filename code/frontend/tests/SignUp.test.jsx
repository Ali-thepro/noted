import { screen } from '@testing-library/react'
import { render } from './test-utils'
import SignUp from '../src/pages/SignUp'
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
})
