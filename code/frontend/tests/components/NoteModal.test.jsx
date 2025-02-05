import { screen, fireEvent, waitFor } from '@testing-library/react'
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

      fireEvent.change(titleInput, { target: { value: '' } })
      fireEvent.change(titleInput, { target: { value: 'New Note Title' } })
      expect(titleInput).toHaveValue('New Note Title')
    })

    it('handles tags input', async () => {
      renderModal()
      const tagsInput = screen.getByLabelText('Tags (comma-separated)')

      fireEvent.change(tagsInput, { target: { value: '' } })
      fireEvent.change(tagsInput, { target: { value: 'tag1, tag2, tag3' } })

      await waitFor(() => {
        expect(tagsInput).toHaveValue('tag1, tag2, tag3')
      })
    })

    it('enables submit button when title is provided', async () => {
      renderModal()
      const titleInput = screen.getByLabelText('Title')
      const submitButton = screen.getByRole('button', { name: /create note/i })

      fireEvent.change(titleInput, { target: { value: '' } })
      fireEvent.change(titleInput, { target: { value: 'Test Title' } })

      await waitFor(() => {
        expect(submitButton).toBeEnabled()
      })
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

      fireEvent.change(titleInput, { target: { value: '' } })
      fireEvent.change(titleInput, { target: { value: 'Updated Title' } })
      fireEvent.change(tagsInput, { target: { value: '' } })
      fireEvent.change(tagsInput, { target: { value: 'new, tags' } })

      await waitFor(() => {
        expect(titleInput).toHaveValue('Updated Title')
        expect(tagsInput).toHaveValue('new, tags')
      })
    })
  })

  describe('Form Submission', () => {
    it('handles create note submission', async () => {
      renderModal()
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
