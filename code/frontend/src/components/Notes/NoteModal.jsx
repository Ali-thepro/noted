import { Modal, Button, Label, TextInput, Textarea } from 'flowbite-react'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { createNote, editNote } from '../../redux/reducers/noteReducer'
import Notification from '../Notification'
import PropTypes from 'prop-types'

const NoteModal = ({ show, onClose, isEditing = false, noteData = null }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const theme = useSelector(state => state.theme)
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isEditing && noteData) {
      setTitle(noteData.title)
      setTags(noteData.tags?.join(', ') || '')
    }
  }, [isEditing, noteData, show])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const processedTags = tags.split(',').map(tag => tag.trim()).filter(Boolean)

      if (isEditing) {
        await dispatch(editNote(noteData.id, {
          ...noteData,
          title: title.trim(),
          tags: processedTags
        }))
      } else {
        const newNote = await dispatch(createNote({
          title: title.trim(),
          content: `# ${title}\n\nStart writing here...`,
          tags: processedTags
        }))
        if (newNote) {
          navigate(`/notes/${newNote.id}`)
        }
      }
      
      setTitle('')
      setTags('')
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setTitle('')
    setTags('')
    onClose()
  }

  return (
    <Modal show={show} onClose={handleClose} className={theme === 'dark' ? 'dark' : ''}>
      <form onSubmit={handleSubmit}>
        <Modal.Header>{isEditing ? 'Edit Note' : 'Create New Note'}</Modal.Header>
        <Modal.Body>
          <Notification />
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" value="Title" />
              <TextInput
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Enter note title"
              />
            </div>
            <div>
              <Label htmlFor="tags" value="Tags (comma-separated)" />
              <Textarea
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tag1, tag2, tag3"
                rows={2}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="focus:ring-0"
          >
            {isSubmitting ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Note')}
          </Button>
          <Button
            color="gray"
            onClick={handleClose}
            className="focus:ring-0"
          >
            Cancel
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

NoteModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
  noteData: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    content: PropTypes.string
  })
}

export default NoteModal