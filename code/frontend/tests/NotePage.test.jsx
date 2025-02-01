import { vi } from 'vitest'
import { forwardRef } from 'react'

vi.mock('@uiw/react-codemirror', () => ({
  default: forwardRef(function CodeMirrorMock(props, ref) {
    return (
      <div ref={ref} data-testid="editor">
        Mocked Editor
      </div>
    )
  })
}))

import { screen, waitFor } from '@testing-library/react'
import { render } from './test-utils'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import NotePage from '../src/pages/NotePage'


const server = setupServer(
  http.get('/api/note/:id', () => {
    return HttpResponse.json({
      id: '123',
      title: 'Test Note',
      content: '# Test Content',
      userId: '1'
    })
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

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
        // Should stay on notes page
        expect(location.pathname).toBe('/notes/123')
        // Check for mocked editor instead of actual textbox
        expect(screen.getByTestId('editor')).toBeInTheDocument()
      })
    })
  })
})
