import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../test-utils'
import NoteModal from '../../src/components/Notes/NoteModal'

describe('NoteModal Component', () => {
  const mockNote = {
    id: '123',
    title: 'Test Note',
    content: '# Test Content',
    tags: ['react', 'testing'],
    user: 'user123',
    updatedAt: new Date().toISOString()
  }

  const mockOnClose = vi.fn()

  const renderModal = (props = {}) => {
    const defaultProps = {
      show: true,
      onClose: mockOnClose,
      isEditing: false,
      noteData: null,
      ...props
    }

    return render(<NoteModal {...defaultProps} />, {
      preloadedState: {
        note: {
          notes: [],
          loading: false,
          error: null
        }
      }
    })
  }
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Create Mode', () => {
    it('renders create note form correctly', () => {
      renderModal()
      expect(screen.getByText('Create New Note')).toBeInTheDocument()
      expect(screen.getByLabelText('Title')).toBeInTheDocument()
      expect(screen.getByLabelText('Tags (comma-separated)')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Create Note' })).toBeInTheDocument()
    })

    it('handles title input', async () => {
      renderModal()
      const titleInput = screen.getByLabelText('Title')
      await userEvent.clear(titleInput)
      await userEvent.type(titleInput, 'New Note Title')
      expect(titleInput).toHaveValue('New Note Title')
    })

    it('handles tags input', async () => {
      renderModal()
      const tagsInput = screen.getByLabelText('Tags (comma-separated)')
      await userEvent.clear(tagsInput)
      await userEvent.type(tagsInput, 'tag1, tag2, tag3')
      expect(tagsInput).toHaveValue('tag1, tag2, tag3')
    })

    it('enables submit button when title is provided', async () => {
      renderModal()
      const titleInput = screen.getByLabelText('Title')
      const submitButton = screen.getByRole('button', { name: 'Create Note' })
      await userEvent.clear(titleInput)
      await userEvent.type(titleInput, 'Test Title')
      expect(submitButton).toBeEnabled()
    })
  })

  describe('Edit Mode', () => {
    it('renders edit note form correctly', () => {
      renderModal({ isEditing: true, noteData: mockNote })
      expect(screen.getByText('Edit Note')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument()
    })

    it('pre-fills form with note data', () => {
      renderModal({ isEditing: true, noteData: mockNote })
      expect(screen.getByLabelText('Title')).toHaveValue(mockNote.title)
      expect(screen.getByLabelText('Tags (comma-separated)')).toHaveValue(mockNote.tags.join(', '))
    })

    it('updates form fields correctly', async () => {
      renderModal({ isEditing: true, noteData: mockNote })
      const titleInput = screen.getByLabelText('Title')
      const tagsInput = screen.getByLabelText('Tags (comma-separated)')
      await userEvent.clear(titleInput)
      await userEvent.type(titleInput, 'Updated Title')
      await userEvent.clear(tagsInput)
      await userEvent.type(tagsInput, 'new, tags')
      await vi.waitFor(() => {
        expect(titleInput).toHaveValue('Updated Title')
        expect(tagsInput).toHaveValue('new, tags')
      })
    })
  })

  describe('Form Submission', () => {
    it('handles create note submission', async () => {
      const { store } = renderModal() //eslint-disable-line
      const titleInput = screen.getByLabelText('Title')
      const tagsInput = screen.getByLabelText('Tags (comma-separated)')

      await userEvent.type(titleInput, 'New Note')
      await userEvent.type(tagsInput, 'tag1, tag2')

      const submitButton = screen.getByRole('button', { name: 'Create Note' })
      await userEvent.click(submitButton)

      expect(mockOnClose).toHaveBeenCalled()
    })
  })
})
