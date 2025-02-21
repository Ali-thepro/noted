import { screen } from '@testing-library/react'
import { render } from '../test-utils'
import NotePreview from '../../src/components/Preview/NotePreview'

describe('NotePreview Component', () => {
  const mockContent = `
# Heading 1
## Heading 2

This is a paragraph with **bold** and *italic* text.

- [ ] Todo item 1
- [x] Todo item 2

[Link](https://example.com)

| Table | Header |
|-------|--------|
| Cell  | Cell   |

~~Strikethrough~~

[^1]: Footnote test

* List item 1
* List item 2

Term
: Definition
`

  const renderPreview = (content = mockContent, viewMode = 'preview') => {
    return render(
      <NotePreview content={content} />,
      {
        preloadedState: {
          note: {
            viewMode
          }
        }
      }
    )
  }

  describe('Markdown Rendering', () => {
    it('renders basic markdown elements correctly', () => {
      renderPreview()

      expect(screen.getByText('Heading 1')).toBeInTheDocument()
      expect(screen.getByText('Heading 2')).toBeInTheDocument()
      expect(screen.getByText(/This is a paragraph/)).toBeInTheDocument()
    })

    it('renders task lists correctly', () => {
      renderPreview()

      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes).toHaveLength(2)
      expect(checkboxes[0]).not.toBeChecked()
      expect(checkboxes[1]).toBeChecked()
    })

    it('renders inline code correctly', () => {
      renderPreview('This is `inline code` test')

      const inlineCode = screen.getByText('inline code')
      expect(inlineCode).toHaveClass('inline-code')
    })

    it('renders links correctly', () => {
      renderPreview()

      const link = screen.getByText('Link')
      expect(link).toHaveAttribute('href', 'https://example.com')
    })

    it('renders tables correctly', () => {
      renderPreview()

      expect(screen.getByText('Table')).toBeInTheDocument()
      expect(screen.getByText('Header')).toBeInTheDocument()
      expect(screen.getAllByText('Cell')).toHaveLength(2)
    })
  })

  describe('Advanced Markdown Features', () => {
    it('renders strikethrough text', () => {
      renderPreview()

      const strikethrough = screen.getByText('Strikethrough')
      expect(strikethrough).toHaveStyle('text-decoration: line-through')
    })

    it('renders definition lists', () => {
      renderPreview()

      expect(screen.getByText('Term')).toBeInTheDocument()
      expect(screen.getByText('Definition')).toBeInTheDocument()
    })
  })
})
