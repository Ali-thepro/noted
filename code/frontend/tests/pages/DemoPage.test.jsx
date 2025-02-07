import { vi } from 'vitest'

vi.mock('@uiw/react-codemirror', () => ({
  default: vi.fn((props) => (
    <div data-testid="editor">
      {props.value || 'Mocked Editor'}
    </div>
  ))
}))

vi.mock('../../src/components/Editor/NoteEditor', () => ({
  default: ({ content }) => (
    <div data-testid="note-editor">
      {content}
    </div>
  )
}))

vi.mock('../../src/components/Preview/NotePreview', () => ({
  default: ({ content }) => (
    <div data-testid="note-preview" role="article">
      {content}
    </div>
  )
}))

import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '../test-utils'
import DemoPage from '../../src/pages/DemoPage'

describe('DemoPage', () => {
  describe('Rendering', () => {
    it('renders editor in edit mode', () => {
      render(<DemoPage />, {
        preloadedState: {
          note: { viewMode: 'edit' }
        }
      })

      expect(screen.getByTestId('note-editor')).toBeInTheDocument()
      expect(screen.queryByTestId('note-preview')).not.toBeInTheDocument()
    })

    it('renders preview in preview mode', () => {
      render(<DemoPage />, {
        preloadedState: {
          note: { viewMode: 'preview' }
        }
      })

      expect(screen.queryByTestId('note-editor')).not.toBeInTheDocument()
      expect(screen.getByTestId('note-preview')).toBeInTheDocument()
      expect(screen.getByText(/Hello, world!/)).toBeInTheDocument()
    })

    it('renders both editor and preview in split mode', () => {
      render(<DemoPage />, {
        preloadedState: {
          note: { viewMode: 'split' }
        }
      })

      expect(screen.getByTestId('note-editor')).toBeInTheDocument()
      expect(screen.getByTestId('note-preview')).toBeInTheDocument()
    })

    it('applies correct layout classes in split mode', () => {
      render(<DemoPage />, {
        preloadedState: {
          note: { viewMode: 'split' }
        }
      })

      const editorContainer = screen.getByTestId('note-editor').parentElement.parentElement
      const previewContainer = screen.getByTestId('note-preview').parentElement

      expect(editorContainer).toHaveClass('w-1/2')
      expect(previewContainer).toHaveClass('w-1/2')
    })
  })
})
