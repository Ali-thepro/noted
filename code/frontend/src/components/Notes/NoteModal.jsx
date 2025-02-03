import { Modal, Button, Label, TextInput, Textarea } from 'flowbite-react'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { createNote, editNote } from '../../redux/reducers/noteReducer'
import { createVersion, getVersions, getVersionChain } from '../../services/version'
import Notification from '../Notification'
import PropTypes from 'prop-types'
import { shouldCreateSnapshot , buildVersionContent} from '../../utils/diff'
import diff_match_patch from '../../utils/diff'
import { arraysEqual } from '../../utils/util'
import { toast } from 'react-toastify'
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
        if (title.trim() === noteData.title && arraysEqual(processedTags, noteData.tags)) {
          toast.info('Note has not changed, no changes made')
          return
        }

        const updatedNote = await dispatch(editNote(noteData.id, {
          ...noteData,
          title: title.trim(),
          tags: processedTags
        }))

        if (updatedNote) {         
          if (updatedNote.title !== noteData.title || !arraysEqual(updatedNote.tags, noteData.tags)) {
            try {
              const versions = await getVersions(updatedNote.id)
              if (versions && versions.length > 0) {
                const latestVersion = versions[0]
                let versionType = 'diff'
                let versionContent
                let baseVersion

                if (shouldCreateSnapshot(latestVersion.metadata.versionNumber)) {
                  versionType = 'snapshot'
                  versionContent = updatedNote.content
                } else {
                  let baseContent
                  if (latestVersion.type === 'snapshot') {
                    baseContent = latestVersion.content
                  } else {
                    const chain = await getVersionChain(updatedNote.id, latestVersion.createdAt)
                    baseContent = buildVersionContent(chain)
                  }

                  const dmp = new diff_match_patch()
                  const diffs = dmp.diff_main(baseContent, updatedNote.content, false)
                  dmp.diff_cleanupEfficiency(diffs)
                  versionContent = dmp.diff_toDelta(diffs)
                  baseVersion = latestVersion.id
                }

                await createVersion(updatedNote.id, {
                  type: versionType,
                  content: versionContent,
                  baseVersion,
                  metadata: {
                    title: updatedNote.title,
                    tags: updatedNote.tags,
                    versionNumber: latestVersion.metadata.versionNumber + 1
                  },
                })
              }
            } catch (error) {
              console.error('Failed to create version:', error)
            }
          }
          setTitle('')
          setTags('')
          onClose()
        }
      } else {
        const newNote = await dispatch(createNote({
          title: title.trim(),
          content: `# ${title}\n\nStart writing here...`,
          tags: processedTags
        }))
        if (newNote) {
          await createVersion(newNote.id, {
            type: 'snapshot',
            content: newNote.content,
            metadata: {
              title: newNote.title,
              tags: newNote.tags,
              versionNumber: 1
            }
          })
          setTitle('')
          setTags('')
          onClose()
          navigate(`/notes/${newNote.id}`)
        }
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
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string),
    user: PropTypes.string,
    content: PropTypes.string,
    lastVisited: PropTypes.string,
    updatedAt: PropTypes.string.isRequired,
  })
}

export default NoteModal
