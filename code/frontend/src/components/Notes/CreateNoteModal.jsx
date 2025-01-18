import { Modal, Button, Label, TextInput, Textarea } from 'flowbite-react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { createNote } from '../../redux/reducers/noteReducer'
import Notification from '../Notification'
import PropTypes from 'prop-types'

const CreateNoteModal = ({ show, onClose }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const theme = useSelector(state => state.theme)
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const noteData = {
        title: title.trim(),
        content: `# ${title}\n\nStart writing here...`,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean)
      }

      const newNote = await dispatch(createNote(noteData))
      if (newNote) {
        onClose()
        navigate(`/notes/${newNote.id}`)
      }
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
        <Modal.Header>Create New Note</Modal.Header>
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
            {isSubmitting ? 'Creating...' : 'Create Note'}
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

CreateNoteModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
}

export default CreateNoteModal
