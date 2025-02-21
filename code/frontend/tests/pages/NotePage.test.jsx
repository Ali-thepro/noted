import { vi } from 'vitest'
import { forwardRef } from 'react'
import { screen, waitFor, act } from '@testing-library/react'
import { render } from '../test-utils'
import userEvent from '@testing-library/user-event'//eslint-disable-line
import NotePage from '../../src/pages/NotePage'
import { createVersion, getVersions, getVersionChain } from '../../src/services/version'//eslint-disable-line
import server from '../../src/mocks/setup' // eslint-disable-line

vi.mock('../../src/services/version', () => ({
  createVersion: vi.fn(),
  getVersions: vi.fn(),
  getVersionChain: vi.fn()
}))

vi.mock('@uiw/react-codemirror', () => ({
  default: forwardRef(function CodeMirrorMock(props, ref) {
    return (
      <div
        ref={ref}
        data-testid="editor"
        onChange={e => props.onChange?.(e.target.value)} //eslint-disable-line
      >
        Mocked Editor
      </div>
    )
  })
}))



describe('NotePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getVersions.mockResolvedValue([{
      id: 'v1',
      type: 'snapshot',
      content: '# Initial Content',
      metadata: { versionNumber: 1 },
      createdAt: new Date().toISOString()
    }])
  })

  describe('NotePage Authentication', () => {
    describe('Authentication Protection', () => {
      it('redirects to signin when user is not authenticated', async () => {
        const { location } = render(<NotePage />, {
          path: '/notes/123',
          preloadedState: {
            auth: { user: null },
            note: { activeNote: null, viewMode: 'edit' }
          },
          routeConfig: [
            { path: '/signin', element: <div>Sign In Page</div> }
          ]
        })

        await waitFor(() => {
          expect(location.pathname).toBe('/signin')
        })
      })
      it('allows access when user is authenticated', async () => {
        const { location } = render(<NotePage />, {
          path: '/notes/123',
          preloadedState: {
            auth: {
              user: { id: '1', username: 'testuser' }
            },
            note: {
              activeNote: {
                id: '123',
                title: 'Test Note',
                content: '# Test Content'
              },
              viewMode: 'edit'
            }
          }
        })

        await waitFor(() => {
          expect(location.pathname).toBe('/notes/123')
          expect(screen.getByTestId('editor')).toBeInTheDocument()
        })
      })
    })
  })

  describe('Version Control', () => {
    const mockNote = {
      id: '123',
      title: 'Test Note',
      content: '# Initial Content'
    }

    it('initializes with latest version', async () => {
      render(<NotePage />, {
        path: '/notes/123',
        preloadedState: {
          auth: { user: { id: '1' } },
          note: {
            activeNote: mockNote,
            viewMode: 'edit'
          }
        }
      })

      await waitFor(() => {
        expect(getVersions).toHaveBeenCalledWith('123')
      })
    })
  })

  describe('View Mode Rendering', () => {
    it('renders editor only in edit mode', async () => {
      await act(async () => {
        render(<NotePage />, {
          path: '/notes/123',
          preloadedState: {
            auth: { user: { id: '1' } },
            note: {
              activeNote: { id: '123', content: '# Test' },
              viewMode: 'edit'
            }
          }
        })
      })

      expect(screen.getByTestId('editor')).toBeInTheDocument()
      expect(screen.queryByRole('article')).not.toBeInTheDocument()
    })

    it('renders both editor and preview in split mode', () => {
      render(<NotePage />, {
        path: '/notes/123',
        preloadedState: {
          auth: { user: { id: '1' } },
          note: {
            activeNote: { id: '123', content: '# Test' },
            viewMode: 'split'
          }
        }
      })

      expect(screen.getByTestId('editor')).toBeInTheDocument()
    })

    it('renders preview only in preview mode', () => {
      render(<NotePage />, {
        path: '/notes/123',
        preloadedState: {
          auth: { user: { id: '1' } },
          note: {
            activeNote: { id: '123', content: '# Test' },
            viewMode: 'preview'
          }
        }
      })

      expect(screen.queryByTestId('editor')).not.toBeInTheDocument()
    })
  })
})
