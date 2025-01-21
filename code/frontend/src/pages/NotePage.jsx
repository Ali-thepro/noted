import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchNote, editNote } from '../redux/reducers/noteReducer'
import NoteEditor from '../components/Editor/NoteEditor'
import NotePreview from '../components/Preview/NotePreview'
import debounce from 'lodash.debounce'
import extractTitle from '../utils/extractTitle'

const AUTOSAVE_DELAY = 700
const SETCONTENT_DELAY = 100

function NotePage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { activeNote, viewMode } = useSelector(state => state.note)
  const user = useSelector(state => state.auth.user)

  const [content, setContent] = useState(activeNote?.content || '')
  const [previewContent, setPreviewContent] = useState(activeNote?.content || '')

  useEffect(() => {
    if (activeNote) {
      setContent(activeNote.content)
      setPreviewContent(activeNote.content)
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
      const title = extractTitle(newContent, activeNote.title)
      dispatch(editNote(activeNote.id, { ...activeNote, content: newContent, title }))
    }
  }, AUTOSAVE_DELAY), [dispatch, activeNote])

  const debouncedSetContent = useMemo(() => debounce((newContent) => {
    setContent(newContent)
    setPreviewContent(newContent)
  }, SETCONTENT_DELAY, {
    trailing: true,
    leading: true
  }), [])

  useEffect(() => {
    return () => {
      debouncedSave.cancel()
      debouncedSetContent.cancel()
    }
  }, [debouncedSave, debouncedSetContent])

  const handleChange = useCallback((newContent) => {
    debouncedSetContent(newContent)
    debouncedSave(newContent)
  }, [debouncedSetContent, debouncedSave])

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
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} h-full overflow-auto border-l dark:border-gray-700 break-words`}>
            <NotePreview content={previewContent} />
          </div>
        )}
      </div>
    </div>
  )
}

export default NotePage
