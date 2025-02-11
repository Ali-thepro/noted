import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchNote, editNote } from '../redux/reducers/noteReducer'
import { createVersion, getVersions, getVersionChain } from '../services/version'
import NoteEditor from '../components/Editor/NoteEditor'
import NotePreview from '../components/Preview/NotePreview'
import debounce from 'lodash.debounce'
import { shouldCreateSnapshot, buildVersionContent, createEncryptedDiff, encryptVersionContent, decryptVersionContent } from '../utils/diff'
import useVersion from '../hooks/useVersion'
import { EncryptionService } from '../utils/encryption'
import memoryStore from '../utils/memoryStore'

const AUTOSAVE_DELAY = 700
const SETCONTENT_DELAY = 100

function NotePage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { activeNote, viewMode } = useSelector(state => state.note)
  const user = useSelector(state => state.auth.user)
  const encryptionService = new EncryptionService()

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
        }
      } catch (error) {
        console.error('Failed to initialize note:', error)
      }
    }

    initializeNote()
  }, [activeNote])

  useEffect(() => {
    const decryptNote = async () => {
      if (!activeNote?.content || !activeNote?.cipherKey || !activeNote?.cipherIv || !activeNote?.contentIv) {
        return
      }

      try {
        const symmetricKey = memoryStore.get()
        if (!symmetricKey) {
          throw new Error('Noted is locked')
        }

        const noteCipherKey = await encryptionService.unwrapNoteCipherKey(activeNote.cipherKey, activeNote.cipherIv, symmetricKey)
        const decrypted = await encryptionService.decryptNoteContent(activeNote.content, activeNote.contentIv, noteCipherKey)

        setContent(decrypted)
        setPreviewContent(decrypted)
      } catch (error) {
        console.error('Failed to decrypt note:', error)

      }
    }

    decryptNote()
  }, [activeNote]) // eslint-disable-line


  const debouncedSave = useMemo(() => debounce(async (newContent) => {
    if (activeNote?.id) {
      try {
        const symmetricKey = memoryStore.get()
        if (!symmetricKey) {
          throw new Error('Noted is locked')
        }

        const noteCipherKey = await encryptionService.unwrapNoteCipherKey(activeNote.cipherKey, activeNote.cipherIv, symmetricKey)
        const { encryptedContent, iv: contentIv } = await encryptionService.encryptNoteContent(newContent, noteCipherKey)

        await dispatch(editNote(activeNote.id, {
          ...activeNote,
          content: encryptedContent,
          contentIv: contentIv
        }))
      } catch (error) {
        console.error('Failed to encrypt note:', error)
      }
    }
  }, AUTOSAVE_DELAY), [dispatch, activeNote]) // eslint-disable-line

  const createVersionHandler = useCallback(async (newContent) => {
    if (!activeNote?.id || !latestVersion) return null

    try {
      const symmetricKey = memoryStore.get()
      if (!symmetricKey) {
        throw new Error('Noted is locked')
      }
      let baseContent
      if (latestVersion.type === 'snapshot') {
        baseContent = await decryptVersionContent(latestVersion, encryptionService, symmetricKey)
      } else {
        const chain = await getVersionChain(activeNote.id, latestVersion.createdAt)
        baseContent = await buildVersionContent(chain, encryptionService, symmetricKey)
      }

      if (baseContent === newContent) {
        return null
      }

      const nextVersionNumber = latestVersion.metadata.versionNumber + 1

      let versionType = 'diff'
      let encryptedVersionData

      if (shouldCreateSnapshot(latestVersion)) {
        versionType = 'snapshot'
        encryptedVersionData = await encryptVersionContent(
          newContent,
          encryptionService,
          symmetricKey,
          {
            cipherKey: activeNote.cipherKey,
            cipherIv: activeNote.cipherIv
          }
        )
      } else {
        encryptedVersionData = await createEncryptedDiff(
          baseContent,
          newContent,
          encryptionService,
          symmetricKey,
          {
            cipherKey: activeNote.cipherKey,
            cipherIv: activeNote.cipherIv
          }
        )
      }

      const newVersion = await createVersion(activeNote.id, {
        type: versionType,
        content: encryptedVersionData.encryptedContent,
        baseVersion: versionType === 'diff' ? latestVersion.id : undefined,
        cipherKey: encryptedVersionData.cipherKey,
        cipherIv: encryptedVersionData.cipherIv,
        contentIv: encryptedVersionData.contentIv,
        metadata: {
          title: activeNote.title,
          tags: activeNote.tags,
          versionNumber: nextVersionNumber
        }
      })

      setLatestVersion(newVersion)
    } catch (error) {
      console.error('Failed to create version:', error)
    }
  }, [activeNote, latestVersion, dispatch]) // eslint-disable-line

  const { maybeCreateVersion } = useVersion(createVersionHandler, 10 * 1000)

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
    maybeCreateVersion(newContent)
  }, [debouncedSetContent, debouncedSave, maybeCreateVersion])

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
