import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'// eslint-disable-line no-unused-vars
import SearchBar from '../../src/components/Notes/SearchBar'
// eslint-disable-next-line no-unused-vars
import server from '../../src/mocks/setup'

describe('SearchBar Component', () => {
  const mockOnKeywordChange = vi.fn()
  const mockOnTagChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders both search inputs correctly', () => {
      render(
        <SearchBar
          keyword=""
          onKeywordChange={mockOnKeywordChange}
          tag=""
          onTagChange={mockOnTagChange}
        />
      )

      // Check if both inputs are rendered
      expect(screen.getByPlaceholderText('Search by keyword...')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Filter by tag...')).toBeInTheDocument()
    })
  })
})
