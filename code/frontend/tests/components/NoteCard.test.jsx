import { screen, waitFor } from '@testing-library/react' // eslint-disable-line
import userEvent from '@testing-library/user-event'
import { render } from '../test-utils'
import NoteCard from '../../src/components/Notes/NoteCard'
// eslint-disable-next-line no-unused-vars
import server from '../../src/mocks/setup'
import moment from 'moment'

describe('NoteCard Component', () => {
  const mockNote = {
    id: '123',
    title: 'Test Note',
    content: '# Test Content',
    tags: ['react', 'javascript', 'testing', 'frontend'],
    updatedAt: '2024-01-01T12:00:00Z',
    user: 'user123'
  }

  const mockOnClick = vi.fn()
  const mockOnTagClick = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders basic note information correctly', () => {
      render(
        <NoteCard
          note={mockNote}
          onClick={mockOnClick}
          onTagClick={mockOnTagClick}
        />
      )
      expect(screen.getByText('Test Note')).toBeInTheDocument()
      expect(screen.getByText(moment(mockNote.updatedAt).fromNow())).toBeInTheDocument()
      expect(screen.getByText(moment(mockNote.updatedAt).format('D MMM YYYY'))).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /edit note/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /delete note/i })).toBeInTheDocument()
    })
  })

  it('renders initial tags with "more" button when there are more than MAX_VISIBLE_TAGS', () => {
    render(
      <NoteCard
        note={mockNote}
        onClick={mockOnClick}
        onTagClick={mockOnTagClick}
      />
    )

    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('javascript')).toBeInTheDocument()
    expect(screen.getByText('testing')).toBeInTheDocument()
    expect(screen.queryByText('frontend')).not.toBeInTheDocument()
    expect(screen.getByText('+1 more')).toBeInTheDocument()
  })
  it('renders all tags when note has fewer than MAX_VISIBLE_TAGS', () => {
    const noteWithFewTags = {
      ...mockNote,
      tags: ['react', 'javascript']
    }
    render(
      <NoteCard
        note={noteWithFewTags}
        onClick={mockOnClick}
        onTagClick={mockOnTagClick}
      />
    )
    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('javascript')).toBeInTheDocument()
    expect(screen.queryByText(/more/i)).not.toBeInTheDocument()
  })
  describe('Interactions', () => {
    it('calls onClick when clicking the card', async () => {
      render(
        <NoteCard
          note={mockNote}
          onClick={mockOnClick}
          onTagClick={mockOnTagClick}
        />
      )

      const card = screen.getByText('Test Note').closest('div')
      await userEvent.click(card)

      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('calls onTagClick when clicking a tag', async () => {
      render(
        <NoteCard
          note={mockNote}
          onClick={mockOnClick}
          onTagClick={mockOnTagClick}
        />
      )

      const tagButton = screen.getByText('react')
      await userEvent.click(tagButton)

      expect(mockOnTagClick).toHaveBeenCalledWith('react')
      expect(mockOnClick).not.toHaveBeenCalled()
    })

    it('opens edit modal when clicking edit button', async () => {
      render(
        <NoteCard
          note={mockNote}
          onClick={mockOnClick}
          onTagClick={mockOnTagClick}
        />
      )

      const editButton = screen.getByRole('button', { name: /edit note/i })
      await userEvent.click(editButton)


      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(mockOnClick).not.toHaveBeenCalled()
    })

    it('shows and hides all tags modal', async () => {
      render(
        <NoteCard
          note={mockNote}
          onClick={mockOnClick}
          onTagClick={mockOnTagClick}
        />
      )

      // Open all tags modal
      const moreButton = screen.getByText('+1 more')
      await userEvent.click(moreButton)

      expect(screen.getByText('frontend')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()

      const closeButton = screen.getByRole('button', { name: /close/i })
      await userEvent.click(closeButton)

      expect(screen.queryByText('frontend')).not.toBeInTheDocument()
    })

    it('prevents event propagation when clicking interactive elements', async () => {
      render(
        <NoteCard
          note={mockNote}
          onClick={mockOnClick}
          onTagClick={mockOnTagClick}
        />
      )

      const editButton = screen.getByRole('button', { name: /edit note/i })
      await userEvent.click(editButton)
      expect(mockOnClick).not.toHaveBeenCalled()

      const tagButton = screen.getByText('react')
      await userEvent.click(tagButton)
      expect(mockOnClick).not.toHaveBeenCalled()

      const moreButton = screen.getByText('+1 more')
      await userEvent.click(moreButton)
      expect(mockOnClick).not.toHaveBeenCalled()
    })
  })
})
