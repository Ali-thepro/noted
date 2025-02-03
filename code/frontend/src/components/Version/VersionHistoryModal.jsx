import { useState, useEffect, useMemo } from 'react'
import { Modal, Button, Spinner, Tooltip } from 'flowbite-react'
import { FaHistory, FaExchangeAlt, FaUndo } from 'react-icons/fa'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { getVersions } from '../../services/version'
import CodeMirror from '@uiw/react-codemirror'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { EditorView } from '@codemirror/view'
import { editorThemes } from '../../utils/themes'
import moment from 'moment'

const VersionHistoryModal = ({ show, onClose, noteId }) => {
  const [versions, setVersions] = useState([])
  const [selectedVersion, setSelectedVersion] = useState(null)
  const [loading, setLoading] = useState(true)
  const theme = useSelector(state => state.theme)
  const editorConfig = useSelector(state => state.editorConfig)

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const fetchedVersions = await getVersions(noteId)
        setVersions(fetchedVersions)
        if (fetchedVersions.length > 0) {
          setSelectedVersion(fetchedVersions[0])
        }
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch versions:', error)
        setLoading(false)
      }
    }

    if (show) {
      fetchVersions()
    }
  }, [noteId, show])

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
            <div className="w-full md:w-1/3 overflow-y-auto border rounded-lg dark:border-gray-700">
              {versions.map((version) => (
                <button
                  key={version.id}
                  onClick={() => setSelectedVersion(version)}
                  className={`w-full text-left p-4 border-b dark:border-gray-700 
                    ${selectedVersion?.id === version.id
                  ? 'bg-gray-100 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
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
                <CodeMirror
                  value={selectedVersion.content}
                  height="100%"
                  theme={editorThemes[editorConfig.theme]}
                  extensions={extensions}
                  className="h-full"
                />
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
          <Tooltip content="Compare with previous version">
            <Button
              color="blue"
              size="sm"
              className="focus:ring-0"
            >
              <FaExchangeAlt className="mr-2 mt-1" />
              Compare
            </Button>
          </Tooltip>
          <Button
            color="failure"
            size="sm"
            className="focus:ring-0"
            onClick={() => {/* Will implement revert later */}}
          >
            <FaUndo className="mr-2 mt-1" />
            Revert
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

VersionHistoryModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  noteId: PropTypes.string.isRequired
}

export default VersionHistoryModal
