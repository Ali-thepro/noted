import { useState } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import NoteModal from './NoteModal'
import { FaClock, FaEdit, FaTimes } from 'react-icons/fa'

const MAX_VISIBLE_TAGS = 3

const NoteCard = ({ note, onClick, onTagClick, onDelete }) => {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAllTags, setShowAllTags] = useState(false)

  const handleDelete = (e) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDelete()
    }
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    setShowEditModal(true)
  }

  const handleTagClick = (e, tag) => {
    e.stopPropagation()
    onTagClick(tag)
  }

  const toggleShowAllTags = (e) => {
    e.stopPropagation()
    setShowAllTags(!showAllTags)
  }

  const visibleTags = note.tags ? note.tags.slice(0, MAX_VISIBLE_TAGS) : []
  const remainingTags = note.tags ? note.tags.length - MAX_VISIBLE_TAGS : 0

  return (
    <>
      <div
        className="relative bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 flex flex-col justify-between hover:shadow-2xl transition-shadow duration-200 cursor-pointer h-[220px]"
        onClick={onClick}
      >
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            aria-label="Edit Note"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
            onClick={handleEdit}
          >
            <FaEdit />
          </button>
          <button
            aria-label="Delete Note"
            className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 focus:outline-none"
            onClick={handleDelete}
          >
            <FaTimes />
          </button>
        </div>

        <div className="flex-grow">
          <h3 className="text-xl font-semibold mt-3 text-gray-900 dark:text-white mb-4 line-clamp-2">
            {note.title}
          </h3>
        </div>

        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-grow flex-wrap items-center">
            {visibleTags.map((tag, index) => (
              <button
                key={`${note.id}-${tag}-${index}`}
                onClick={(e) => handleTagClick(e, tag)}
                className="m-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition"
              >
                {tag}
              </button>
            ))}
            {remainingTags > 0 && (
              <button
                onClick={toggleShowAllTags}
                className="m-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                +{remainingTags} more
              </button>
            )}
          </div>
        )}

        <div className="flex justify-between items-center mt-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <FaClock className="mr-1 text-gray-400 dark:text-gray-500" />
            <span>{moment(note.updatedAt).fromNow()}</span>
          </div>

          <div className="flex items-center">
            <FaEdit className="mr-1 text-gray-400 dark:text-gray-500" />
            <span>{moment(note.updatedAt).format('D MMM YYYY')}</span>
          </div>
        </div>
      </div>

      <NoteModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        isEditing={true}
        noteData={note}
      />

      {showAllTags && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h4 className="text-md font-semibold mb-4">All Tags</h4>
            <div className="flex flex-wrap">
              {note.tags.map((tag, index) => (
                <button
                  key={`${note.id}-all-${tag}-${index}`}
                  onClick={(e) => handleTagClick(e, tag)}
                  className="m-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                >
                  {tag}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAllTags(false)}
              className="mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}

NoteCard.propTypes = {
  note: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string),
    user: PropTypes.string,
    content: PropTypes.string,
    lastVisited: PropTypes.string,
    updatedAt: PropTypes.string.isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  onTagClick: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}

export default NoteCard
