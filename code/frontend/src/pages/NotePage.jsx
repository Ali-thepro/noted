import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchNote, editNote } from '../redux/reducers/noteReducer'
import { createVersion, getVersions, getVersionChain } from '../services/version'
import NoteEditor from '../components/Editor/NoteEditor'
import NotePreview from '../components/Preview/NotePreview'
import debounce from 'lodash.debounce'
import extractTitle from '../utils/extractTitle'
import diff_match_patch from '../utils/diff'
import { shouldCreateSnapshot, buildVersionContent } from '../utils/diff'

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
  const [latestVersion, setLatestVersion] = useState(null)

  useEffect(() => {
    if (!user) {
      navigate('/signin')
      return
    }

    if (id) {
      dispatch(fetchNote(id))
    }
  }, [dispatch, id, user, navigate])

  useEffect(() => {
    const initializeNote = async () => {
      if (!activeNote?.id) return

      try {
        const versions = await getVersions(activeNote.id)
        if (versions && versions.length > 0) {
          setLatestVersion(versions[0])
          setContent(activeNote.content)
          setPreviewContent(activeNote.content)
        }
      } catch (error) {
        console.error('Failed to initialize note:', error)
      }
    }

    initializeNote()
  }, [activeNote])


  const debouncedSave = useMemo(() => debounce(async (newContent) => {
    if (!activeNote?.id || !latestVersion) return

    try {
      let baseContent
      if (latestVersion.type === 'snapshot') {
        baseContent = latestVersion.content
      } else {
        const chain = await getVersionChain(activeNote.id, latestVersion.createdAt)
        baseContent = buildVersionContent(chain)
      }

      if (baseContent === newContent) {
        return
      }

      const title = extractTitle(newContent, activeNote.title)
      const nextVersionNumber = latestVersion.metadata.versionNumber + 1

      let versionType = 'diff'
      let versionContent
      let baseVersion

      if (shouldCreateSnapshot(latestVersion)) {
        versionType = 'snapshot'
        versionContent = newContent
      } else {
        const dmp = new diff_match_patch()
        const diffs = dmp.diff_main(baseContent, newContent, false)
        dmp.diff_cleanupEfficiency(diffs)
        versionContent = dmp.diff_toDelta(diffs)
        baseVersion = latestVersion.id
      }

      const newVersion = await createVersion(activeNote.id, {
        type: versionType,
        content: versionContent,
        baseVersion,
        metadata: {
          title,
          tags: activeNote.tags,
          versionNumber: nextVersionNumber
        }
      })

      await dispatch(editNote(activeNote.id, {
        ...activeNote,
        content: newContent,
        title
      }))

      setLatestVersion(newVersion)
    } catch (error) {
      console.error('Failed to save version:', error)
    }
  }, AUTOSAVE_DELAY), [dispatch, activeNote, latestVersion])


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
