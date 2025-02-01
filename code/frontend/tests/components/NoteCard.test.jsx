import { screen, waitFor } from '@testing-library/react' // eslint-disable-line
import userEvent from '@testing-library/user-event' // eslint-disable-line
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
})
