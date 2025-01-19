import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { initializeNotes } from '../redux/reducers/noteReducer'
import NoteCard from '../components/Notes/NoteCard'
import SearchBar from '../components/Notes/SearchBar'
import SortControls from '../components/Notes/SortControls'
import { Spinner } from 'flowbite-react'

const HomePage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { notes, loading } = useSelector(state => state.note)
  const user = useSelector(state => state.auth.user)
  
  const [searchText, setSearchText] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    dispatch(initializeNotes())
  }, [dispatch])

  const handleSearch = (query) => {
    setSortBy('date')
    setSortOrder('desc')
    setSearchText(query.toLowerCase())
  }

  const handleNoteClick = (noteId) => {
    navigate(`/notes/${noteId}`)
  }

  const filteredNotes = searchText
    ? notes.filter(note => 
        note.title.toLowerCase().includes(searchText) ||
        note.content.toLowerCase().includes(searchText) ||
        (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchText)))
      )
    : notes

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'desc' 
        ? new Date(b.updatedAt) - new Date(a.updatedAt)
        : new Date(a.updatedAt) - new Date(b.updatedAt)
    }
    return sortOrder === 'desc'
      ? b.title.localeCompare(a.title)
      : a.title.localeCompare(b.title)
  })

  if (!user) {
    return (
      <div className="flex justify-center mt-10">
        <p className="text-center text-gray-500 dark:text-gray-400">
          Please sign in to view your notes.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="xl" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <SearchBar value={searchText} onSearch={handleSearch} />
            </div>
            <SortControls
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortByChange={setSortBy}
              onSortOrderChange={setSortOrder}
            />
          </div>

          {sortedNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedNotes.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onClick={() => handleNoteClick(note.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              {searchText ? 'No notes found matching your search.' : 'No notes found. Create a new note to get started!'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HomePage