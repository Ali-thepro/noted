import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchNote, editNote } from '../redux/reducers/noteReducer'
import NoteEditor from '../components/Editor/NoteEditor'
import NotePreview from '../components/Preview/NotePreview'
import debounce from 'lodash.debounce'

const AUTOSAVE_DELAY = 1000

function NotePage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { activeNote, viewMode } = useSelector(state => state.note)
  const user = useSelector(state => state.auth.user)

  const [content, setContent] = useState(activeNote?.content || '')

  useEffect(() => {
    if (activeNote) {
      setContent(activeNote.content)
    }
  }, [activeNote])

  useEffect(() => {
    if (!user) {
      navigate('/signin')
      return
    }

    if (id) {
      dispatch(fetchNote(id))
    }
  }, [dispatch, id, user, navigate])

  const debouncedSave = useMemo(() => debounce((newContent) => {
    if (activeNote?.id) {
      dispatch(editNote(activeNote.id, { ...activeNote, content: newContent }))
    }
  }, AUTOSAVE_DELAY), [dispatch, activeNote])

  useEffect(() => {
    if (content !== activeNote?.content) {
      debouncedSave(content)
    }
    return () => {
      debouncedSave.flush()
      debouncedSave.cancel()
    }
  }, [content, debouncedSave, activeNote?.content])

  const handleChange = (newContent) => {
    setContent(newContent)
  }


  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="flex flex-1 overflow-hidden">
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} flex flex-col h-full`}>
            <NoteEditor
              content={content}
              onChange={handleChange}
            />
          </div>
        )}

        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} h-full overflow-auto border-l dark:border-gray-700`}>
            <NotePreview content={content} />
          </div>
        )}
      </div>
    </div>
  )
}

export default NotePage
