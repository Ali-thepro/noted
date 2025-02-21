import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../test-utils'
import OAuth from '../../src/components/OAuth'

describe('OAuth Component', () => {
  let mockHref = ''
  const originalLocation = window.location

  beforeEach(() => {
    const url = new URL('http://localhost:5173')
    const mockLocation = {
      ...url,
      get href() {
        return mockHref || url.href
      },
      set href(value) {
        mockHref = value
      }
    }
    delete window.location
    window.location = mockLocation
  })

  afterEach(() => {
    window.location = originalLocation
    mockHref = ''
  })

  it('renders OAuth buttons', () => {
    render(<OAuth />)
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in with github/i })).toBeInTheDocument()
  })

  it('handles Google OAuth redirect without CLI mode', async () => {
    render(<OAuth />)

    const googleButton = screen.getByRole('button', { name: /sign in with google/i })
    await userEvent.click(googleButton)

    expect(window.location.href).toBe('/api/auth/google')
  })

  it('handles GitHub OAuth redirect without CLI mode', async () => {
    render(<OAuth />)

    const githubButton = screen.getByRole('button', { name: /sign in with github/i })
    await userEvent.click(githubButton)

    expect(window.location.href).toBe('/api/auth/github')
  })

  it('handles Google OAuth redirect with CLI mode', async () => {
    const redirectUrl = 'http://localhost:3000/callback'
    render(<OAuth />, {
      path: `/signin?mode=cli&redirect=${redirectUrl}`
    })

    const googleButton = screen.getByRole('button', { name: /sign in with google/i })
    await userEvent.click(googleButton)

    expect(window.location.href).toBe(`/api/auth/google?mode=cli&redirect=${redirectUrl}`)
  })

  it('handles GitHub OAuth redirect with CLI mode', async () => {
    const redirectUrl = 'http://localhost:3000/callback'
    render(<OAuth />, {
      path: `/signin?mode=cli&redirect=${redirectUrl}`
    })

    const githubButton = screen.getByRole('button', { name: /sign in with github/i })
    await userEvent.click(githubButton)

    expect(window.location.href).toBe(`/api/auth/github?mode=cli&redirect=${redirectUrl}`)
  })

  it('preserves query parameters across route changes', async () => {
    const redirectUrl = 'http://localhost:3000/callback'
    const { location } = render(<OAuth />, {
      path: `/signin?mode=cli&redirect=${redirectUrl}`,
      routeConfig: [
        { path: '/signin', element: <OAuth /> },
        { path: '/signup', element: <div>Sign Up Page</div> }
      ]
    })

    expect(location.search).toBe(`?mode=cli&redirect=${redirectUrl}`)
  })
})
