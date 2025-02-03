import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
      expect(screen.getByPlaceholderText('Search by keyword...')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Filter by tag...')).toBeInTheDocument()
    })

    it('renders with initial values', () => {
      render(
        <SearchBar
          keyword="test"
          onKeywordChange={mockOnKeywordChange}
          tag="react"
          onTagChange={mockOnTagChange}
        />
      )
      expect(screen.getByPlaceholderText('Search by keyword...')).toHaveValue('test')
      expect(screen.getByPlaceholderText('Filter by tag...')).toHaveValue('react')
    })
  })

  describe('Interactions', () => {
    it('calls onKeywordChange when typing in keyword search', async () => {
      render(
        <SearchBar
          keyword=""
          onKeywordChange={mockOnKeywordChange}
          tag=""
          onTagChange={mockOnTagChange}
        />
      )

      const keywordInput = screen.getByPlaceholderText('Search by keyword...')
      await userEvent.type(keywordInput, 'test')

      expect(mockOnKeywordChange).toHaveBeenCalledTimes(4)
    })

    it('calls onTagChange when typing in tag search', async () => {
      render(
        <SearchBar
          keyword=""
          onKeywordChange={mockOnKeywordChange}
          tag=""
          onTagChange={mockOnTagChange}
        />
      )

      const tagInput = screen.getByPlaceholderText('Filter by tag...')
      await userEvent.type(tagInput, 'react')

      expect(mockOnTagChange).toHaveBeenCalledTimes(5)
    })

    it('handles empty input values', async () => {
      render(
        <SearchBar
          keyword="test"
          onKeywordChange={mockOnKeywordChange}
          tag="react"
          onTagChange={mockOnTagChange}
        />
      )

      const keywordInput = screen.getByPlaceholderText('Search by keyword...')
      const tagInput = screen.getByPlaceholderText('Filter by tag...')

      await userEvent.clear(keywordInput)
      expect(mockOnKeywordChange).toHaveBeenCalledWith('')

      await userEvent.clear(tagInput)
      expect(mockOnTagChange).toHaveBeenCalledWith('')
    })
  })

})
