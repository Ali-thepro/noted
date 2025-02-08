import { vi } from 'vitest'
import { forwardRef } from 'react'
import { screen, waitFor } from '@testing-library/react'
import { render } from '../test-utils'
import NotePage from '../../src/pages/NotePage'
import server from '../../src/mocks/setup' // eslint-disable-line

vi.mock('@uiw/react-codemirror', () => ({
  default: forwardRef(function CodeMirrorMock(props, ref) {
    return (
      <div ref={ref} data-testid="editor">
        Mocked Editor
      </div>
    )
  })
}))

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
