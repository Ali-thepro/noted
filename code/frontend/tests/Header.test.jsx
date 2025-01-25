import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from './test-utils'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import Header from '../src/components/Header'

const server = setupServer(
  http.post('/api/auth/signout', () => {
    return HttpResponse.json({ message: 'Signed out successfully' })
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Header Component', () => {
  describe('Theme Toggle', () => {
    it('toggles theme between light and dark', async () => {
      const { store } = render(<Header />, {
        preloadedState: {
          theme: 'light',
          auth: { user: null },
          note: { viewMode: 'edit' }
        }
      })

      const themeButton = screen.getByRole('button', { name: /toggle theme/i })

      expect(store.getState().theme).toBe('light')
      expect(screen.getByTestId('theme-icon-moon')).toBeInTheDocument()

      await userEvent.click(themeButton)

      expect(store.getState().theme).toBe('dark')
      expect(screen.getByTestId('theme-icon-sun')).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('navigates to correct routes when clicking nav links', async () => {
      render(<Header />, {
        path: '/',
        routeConfig: [
          { path: '/about', element: <div>About Page</div> },
          { path: '/signin', element: <div>Sign In Page</div> }
        ]
      })

      const aboutLink = screen.getByRole('link', { name: /about/i })
      await userEvent.click(aboutLink)

      expect(screen.getByText('About Page')).toBeInTheDocument()
    })
  })

  describe('Authentication State', () => {
    it('shows sign in button when user is not authenticated', () => {
      render(<Header />, {
        preloadedState: {
          auth: { user: null },
          theme: 'light',
          note: { viewMode: 'edit' }
        }
      })

      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument()
    })

    it('shows logout button and handles logout when user is authenticated', async () => {
      const { store } = render(<Header />, {
        preloadedState: {
          auth: {
            user: { id: '1', username: 'testuser', email: 'test@test.com', oauth: false, provider: 'local' },
            loading: false
          },
          theme: 'light',
          note: { viewMode: 'edit' }
        }
      })

      const logoutButton = screen.getByRole('button', { name: /logout/i })
      expect(logoutButton).toBeInTheDocument()

      await userEvent.click(logoutButton)

      await waitFor(() => {
        expect(store.getState().auth.user).toBeNull()
      })
    })
  })

  describe('Note Creation Modal', () => {
    it('opens note creation modal when authenticated user clicks new note', async () => {
      render(<Header />, {
        preloadedState: {
          auth: {
            user: { id: '1', username: 'testuser', email: 'test@test.com', oauth: false, provider: 'local' },
            loading: false
          },
          theme: 'light',
          note: { viewMode: 'edit' }
        }
      })

      const newNoteButton = screen.getByRole('button', { name: /new note/i })
      await userEvent.click(newNoteButton)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('redirects to signin when unauthenticated user clicks new note', async () => {
      render(<Header />, {
        path: '/',
        routeConfig: [
          { path: '/signin', element: <div>Sign In Page</div> }
        ],
        preloadedState: {
          auth: { user: null },
          theme: 'light',
          note: { viewMode: 'edit' }
        }
      })

      const newNoteButton = screen.getByRole('button', { name: /new note/i })
      await userEvent.click(newNoteButton)

      expect(screen.getByText('Sign In Page')).toBeInTheDocument()
    })
  })

  describe('View Mode Controls', () => {
    it('shows view mode controls only on note pages', () => {
      render(<Header />, {
        path: '/notes/123',
        preloadedState: {
          auth: { user: null },
          theme: 'light',
          note: { viewMode: 'edit' }
        }
      })

      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /split/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /preview/i })).toBeInTheDocument()
    })

    it('changes view mode when clicking view mode buttons', async () => {
      const { store } = render(<Header />, {
        path: '/notes/123',
        preloadedState: {
          auth: { user: null },
          theme: 'light',
          note: { viewMode: 'edit' }
        }
      })

      const splitButton = screen.getByRole('button', { name: /split/i })
      await userEvent.click(splitButton)

      expect(store.getState().note.viewMode).toBe('split')
    })
  })
})
