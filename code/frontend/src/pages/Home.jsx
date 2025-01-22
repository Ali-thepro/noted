import { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { initializeNotes } from '../redux/reducers/noteReducer'
import NoteCard from '../components/Notes/NoteCard'
import SearchBar from '../components/Notes/SearchBar'
import SortControls from '../components/Notes/SortControls'
import { Spinner, Pagination } from 'flowbite-react'
import debounce from 'lodash.debounce'

const HomePage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { notes, total, loading } = useSelector(state => state.note)
  const user = useSelector(state => state.auth.user)

  const [keyword, setKeyword] = useState('')
  const [tag, setTag] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const limit = 9

  const debouncedInitializeNotes = useMemo(
    () =>
      debounce((query) => {
        dispatch(initializeNotes(query))
      }, 500),
    [dispatch]
  )

  useEffect(() => {
    const params = []
    if (keyword) params.push(`search=${encodeURIComponent(keyword)}`)
    if (tag) params.push(`tag=${encodeURIComponent(tag)}`)
    const querySortBy = sortBy === 'date' ? 'updatedAt' : 'title'
    const querySortOrder = sortOrder
    const queryStartIndex = (currentPage - 1) * limit
    params.push(`sortBy=${encodeURIComponent(querySortBy)}`)
    params.push(`sortOrder=${encodeURIComponent(querySortOrder)}`)
    params.push(`startIndex=${encodeURIComponent(queryStartIndex)}`)
    params.push(`limit=${encodeURIComponent(limit)}`)
    const query = params.length > 0 ? params.join('&') : ''

    debouncedInitializeNotes(query)

    return () => {
      debouncedInitializeNotes.cancel()
    }
  }, [debouncedInitializeNotes, keyword, tag, sortBy, sortOrder, currentPage])

  const handleKeywordChange = (value) => {
    setSortBy('date')
    setSortOrder('desc')
    setKeyword(value)
    setCurrentPage(1)
  }

  const handleTagChange = (value) => {
    setSortBy('date')
    setSortOrder('desc')
    setTag(value)
    setCurrentPage(1)
  }

  const handleNoteClick = (noteId) => {
    navigate(`/notes/${noteId}`)
  }

  const totalPages = Math.ceil(total / limit)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  if (!user) {
    return (
      <div className="flex justify-center mt-10">
        <p className="text-center text-gray-500 dark:text-gray-400">
          Please sign in to view your notes.
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-[1070px] mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <SearchBar
                keyword={keyword}
                onKeywordChange={handleKeywordChange}
                tag={tag}
                onTagChange={handleTagChange}
              />
            </div>
            <SortControls
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortByChange={setSortBy}
              onSortOrderChange={setSortOrder}
            />
          </div>

          {loading && (
            <div className="flex items-center justify-center mt-20">
              <Spinner size="xl" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onClick={() => handleNoteClick(note.id)}
                onTagClick={handleTagChange}
              />
            ))}
          </div>

          {notes.length === 0 && !loading && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              {(keyword || tag)
                ? 'No notes found matching your search.'
                : 'No notes found. Create a new note to get started!'}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                showIcons
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HomePage
