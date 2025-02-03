import { useState, useEffect, useMemo } from 'react'
import { Modal, Button, Spinner, Tooltip } from 'flowbite-react'
import { FaHistory, FaExchangeAlt, FaUndo } from 'react-icons/fa'
import PropTypes from 'prop-types'
import { useSelector, useDispatch } from 'react-redux'
import { editNote } from '../../redux/reducers/noteReducer'
import { getVersions, getVersionChain, createVersion } from '../../services/version'
import CodeMirror from '@uiw/react-codemirror'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { EditorView } from '@codemirror/view'
import { editorThemes } from '../../utils/themes'
import { buildVersionContent } from '../../utils/diff'
import moment from 'moment'
import { toast } from 'react-toastify'
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued'


const VersionHistoryModal = ({ show, onClose, note }) => {
  const dispatch = useDispatch()
  const [versions, setVersions] = useState([])
  const [selectedVersion, setSelectedVersion] = useState(null)
  const [versionContent, setVersionContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState(false)
  const [isComparing, setIsComparing] = useState(false)
  const [comparisonData, setComparisonData] = useState(null)
  const theme = useSelector(state => state.theme)
  const editorConfig = useSelector(state => state.editorConfig)
  const activeNote = useSelector(state => state.note.activeNote)

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const fetchedVersions = await getVersions(note.id)
        setVersions(fetchedVersions)
        if (fetchedVersions.length > 0) {
          setSelectedVersion(fetchedVersions[0])
        }
        let content
        if (fetchedVersions[0].type === 'snapshot') {
          content = fetchedVersions[0].content
        } else {
          const chain = await getVersionChain(note.id, fetchedVersions[0].createdAt)
          content = buildVersionContent(chain)
        }
        setVersionContent(content)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch versions:', error)
        setLoading(false)
        toast.error('Failed to fetch versions')
      }
    }

    if (show) {
      fetchVersions()
    }
  }, [note.id, show])

  const handleVersionSelect = async (version) => {
    setSelectedVersion(version)
    setIsComparing(false)
    try {
      let content
      if (version.type === 'snapshot') {
        content = version.content
      } else {
        const chain = await getVersionChain(note.id, version.createdAt)
        content = buildVersionContent(chain)
      }
      setVersionContent(content)
    } catch (error) {
      console.error('Failed to build version content:', error)
      toast.error('Failed to load version content')
    }
  }

  const handleCompare = async () => {
    if (!selectedVersion) return

    if (isComparing) {
      setIsComparing(false)
      return
    }

    try {
      setLoading(true)
      const currentIndex = versions.findIndex(v => v.id === selectedVersion.id)
      if (currentIndex === -1 || currentIndex === versions.length - 1) {
        toast.error('No previous version to compare with')
        return
      }

      const prevVersion = versions[currentIndex + 1]

      let selectedContent = versionContent
      let prevContent

      if (prevVersion.type === 'snapshot') {
        prevContent = prevVersion.content
      } else {
        const chain = await getVersionChain(note.id, prevVersion.createdAt)
        prevContent = buildVersionContent(chain)
      }

      setComparisonData({
        oldValue: prevContent,
        newValue: selectedContent,
      })
      setIsComparing(true)
    } catch (error) {
      console.error('Failed to compare versions:', error)
      toast.error('Failed to compare versions')
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async () => {
    if (!selectedVersion || !activeNote) return

    try {
      setRestoring(true)
      const updatedNote = await dispatch(editNote(activeNote.id, {
        ...activeNote,
        title: selectedVersion.metadata.title,
        content: versionContent,
        tags: selectedVersion.metadata.tags
      }))

      if (updatedNote) {
        await createVersion(note.id, {
          type: 'snapshot',
          content: versionContent,
          metadata: {
            title: selectedVersion.metadata.title,
            tags: selectedVersion.metadata.tags,
            versionNumber: versions[0].metadata.versionNumber + 1
          }
        })
        toast.success('Note restored successfully')
        onClose()
      }
    } catch (error) {
      console.error('Failed to restore version:', error)
      toast.error('Failed to restore version')
    } finally {
      setRestoring(false)
    }
  }

  const extensions = useMemo(() => [
    markdown({ base: markdownLanguage, codeLanguages: languages }),
    EditorView.editable.of(false),
    EditorView.lineWrapping,
    EditorView.theme({
      '&': {
        fontSize: `${editorConfig.fontSize}px`,
        fontFamily: `"${editorConfig.fontFamily}", monospace`
      },
      '.cm-content': {
        fontFamily: `"${editorConfig.fontFamily}", monospace`
      },
      '.cm-line': {
        padding: '0 4px'
      }
    })
  ], [editorConfig.fontSize, editorConfig.fontFamily])

  return (
    <Modal
      show={show}
      onClose={onClose}
      size="7xl"
      className={theme === 'dark' ? 'dark' : ''}
    >
      <Modal.Header className="flex items-center">
        <div className="flex items-center">
          <FaHistory className="mr-2 mt-1" />
          <span>Version History</span>
        </div>
      </Modal.Header>

      <Modal.Body className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <Spinner size="xl" />
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-4 h-[600px]">
            <div className="w-full md:w-1/3 overflow-y-auto border rounded-lg dark:border-gray-500">
              {versions.map((version) => (
                <button
                  key={version.id}
                  onClick={() => handleVersionSelect(version)}
                  className={`w-full text-left p-4 border-b dark:border-gray-600 
                    ${selectedVersion?.id === version.id
                  ? 'bg-gray-200 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-800'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-medium truncate max-w-[70%] dark:text-white">
                      {version.metadata.title || 'Untitled'}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                      v{version.metadata.versionNumber}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {moment(version.createdAt).format('MMM D, YYYY h:mm A')}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex-1 h-full overflow-hidden border rounded-lg dark:border-gray-700">
              {selectedVersion && (
                isComparing ? (
                  <div className="h-full overflow-auto">
                    <ReactDiffViewer
                      oldValue={comparisonData.oldValue}
                      newValue={comparisonData.newValue}
                      splitView={false}
                      useDarkTheme={theme === 'dark'}
                      compareMethod={DiffMethod.WORDS}
                      styles={{
                        variables: {
                          dark: {
                            codeFoldContentColor: '#c0caf5'
                          }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <CodeMirror
                    value={versionContent}
                    height="100%"
                    theme={editorThemes[editorConfig.theme]}
                    extensions={extensions}
                    className="h-full"
                  />
                )
              )}
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <div className="flex gap-2 ml-auto">
          <Button
            color="gray"
            size="sm"
            onClick={onClose}
            className="focus:ring-0"
          >
            Close
          </Button>
          <Tooltip content="Compare with previous version"
            className="bg-gray-800 dark:bg-gray-800"
            arrow={false}
          >
            <Button
              color="blue"
              size="sm"
              onClick={handleCompare}
              disabled={!selectedVersion || loading}
            >
              <FaExchangeAlt className="mr-2 mt-1" />
              {isComparing ? 'Show Content' : 'Compare'}
            </Button>
          </Tooltip>
          <Button
            color="failure"
            size="sm"
            onClick={handleRestore}
            disabled={restoring}
          >
            <FaUndo className="mr-2 mt-1" />
            {restoring ? 'Restoring...' : 'Revert'}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

VersionHistoryModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  note: PropTypes.object.isRequired
}

export default VersionHistoryModal
