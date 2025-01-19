import { Card, Button } from 'flowbite-react'
import { FaClock, FaEdit, FaTimes } from 'react-icons/fa'
import PropTypes from 'prop-types'
import moment from 'moment'
import { useDispatch } from 'react-redux'
import { deleteNote } from '../../redux/reducers/noteReducer'
import { useState } from 'react'
import NoteModal from './NoteModal'

const NoteCard = ({ note, onClick, onTagClick }) => {
  const dispatch = useDispatch()
  const [showEditModal, setShowEditModal] = useState(false)

  const handleDelete = (e) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this note?')) {
      dispatch(deleteNote(note.id))
    }
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    setShowEditModal(true)
  }

  const handleTagClick = (e, tag) => {
    e.stopPropagation()  // This prevents the note card click
    onTagClick(tag)
  }

  return (
    <>
      <Card
        className="relative hover:shadow-lg transition-shadow duration-200 cursor-pointer"
        onClick={onClick}
      >
        <Button
          className="absolute top-2 left-2 focus:ring-0"
          color="gray"
          size="xs"
          pill
          onClick={handleEdit}
        >
          <FaEdit />

        </Button>
        <Button
          className="absolute top-2 right-2 focus:ring-0"
          color="gray"
          size="xs"
          pill
          onClick={handleDelete}
        >
          <FaTimes />
        </Button>

        <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white pr-8 line-clamp-1 mt-5">
          {note.title}
        </h5>

        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <FaClock className="w-3 h-3 mt-1" />
            <span>{moment(note.updatedAt).fromNow()}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaEdit className="w-3 h-3 mt-1" />
            <span>{moment(note.updatedAt).format('D MMM YYYY')}</span>
          </div>
        </div>

        {note.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {note.tags.map(tag => (
              <span
                key={note.id + tag}
                className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                onClick={(e) => handleTagClick(e, tag)}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </Card>

      <NoteModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        isEditing={true}
        noteData={note}
      />
    </>
  )
}

NoteCard.propTypes = {
  note: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string),
    lastVisited: PropTypes.string,
    updatedAt: PropTypes.string.isRequired
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  onTagClick: PropTypes.func.isRequired
}

export default NoteCard
