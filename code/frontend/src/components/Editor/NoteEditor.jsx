import { useCallback, useState, useRef, useMemo, useEffect } from 'react'
import EditorStatusBar from './EditorStatusBar'
import { updateConfig } from '../../redux/reducers/editorConfigReducer'
import PropTypes from 'prop-types'
import CodeMirror from '@uiw/react-codemirror'
import { hyperLink } from '@uiw/codemirror-extensions-hyper-link'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { EditorView, scrollPastEnd } from '@codemirror/view'
import { indentUnit } from '@codemirror/language'
import { vim } from '@replit/codemirror-vim'
import { emacs } from '@replit/codemirror-emacs'
import { vscodeKeymap } from '@replit/codemirror-vscode-keymap'
import { indentWithTab } from '@codemirror/commands'
import { keymap as keymapView } from '@codemirror/view'
import { defaultKeymap } from '@codemirror/commands'
import { useSelector, useDispatch } from 'react-redux'
import { python } from '@codemirror/lang-python'
import { javascript } from '@codemirror/lang-javascript'
import { sql } from '@codemirror/lang-sql'
import { go } from '@codemirror/lang-go'
import Toolbar from './Toolbar'
import { editorThemes } from '../../utils/themes'
import { findLanguageByCodeBlockName } from '../../utils/find-language'

const NoteEditor = ({ content, onChange }) => {
  const dispatch = useDispatch()
  const [position, setPosition] = useState({ line: 1, column: 1 })
  const config = useSelector(state => state.editorConfig)
  const editorRef = useRef(null)
  const [extensions, setExtensions] = useState([])

  const getKeymapExtension = useCallback((type) => {
    switch (type) {
    case 'vim':
      return [vim()]
    case 'emacs':
      return [emacs()]
    case 'vscode':
      return [keymapView.of(vscodeKeymap)]
    case 'default':
      return [keymapView.of(defaultKeymap)]
    default:
      return []
    }
  }, [])

  const handleToolbarAction = useCallback((actionObj) => {
    const view = editorRef.current?.view
    if (!view) return

    const { state } = view
    const { from, to } = state.selection.main
    const selectedText = state.sliceDoc(from, to)

    if (['header', 'quote', 'ul', 'ol', 'checklist', 'table', 'line'].includes(actionObj.action)) {
      const line = state.doc.lineAt(from)
      const transaction = state.update({
        changes: {
          from: line.from,
          to: line.from,
          insert: actionObj.prefix
        }
      })
      view.dispatch(transaction)
    } else if (actionObj.action === 'link') {
      const transaction = state.update({
        changes: {
          from,
          to,
          insert: actionObj.prefix + (selectedText || 'description') + '](https://)'
        }
      })
      view.dispatch(transaction)
    } else {
      const transaction = state.update({
        changes: {
          from,
          to,
          insert: `${actionObj.prefix}${
            selectedText
              ? selectedText
              : actionObj.action === 'image'
                ? 'alt text here'
                : 'your text here'
          }${actionObj.suffix}`
        }
      })
      view.dispatch(transaction)
    }
  }, [])

  const baseExtensions = useMemo(() => [
    markdown({
      base: markdownLanguage,
      codeLanguages: (input) => findLanguageByCodeBlockName(languages, input)
    }),
    hyperLink,
    scrollPastEnd(),
    EditorView.lineWrapping,
    indentUnit.of(' '.repeat(config.indentSize)),
    keymapView.of([{
      key: 'Tab',
      run: indentWithTab
    }])
  ], [config.indentSize])

  useEffect(() => {
    setExtensions([
      ...baseExtensions,
      ...getKeymapExtension(config.mapping),
      python(),
      javascript(),
      sql(),
      go(),
      EditorView.theme({
        '&': {
          fontSize: `${config.fontSize}px`,
          fontFamily: `"${config.fontFamily}", monospace`
        },
        '.cm-content': {
          fontFamily: `"${config.fontFamily}", monospace`
        },
        '.cm-line': {
          padding: '0 4px'
        }
      })
    ])
  }, [baseExtensions, config.mapping, config.fontSize, config.fontFamily, getKeymapExtension])

  const handleChange = useCallback((value, viewUpdate) => {
    onChange(value)

    const pos = viewUpdate.state.selection.main.head
    const line = viewUpdate.state.doc.lineAt(pos)
    setPosition({
      line: line.number,
      column: pos - line.from + 1
    })
  }, [onChange])

  const handleConfigChange = useCallback((newConfig) => {
    dispatch(updateConfig(newConfig))
  }, [dispatch])

  return (
    <div className="flex flex-col h-full">
      <Toolbar onAction={handleToolbarAction} />
      <div className="flex flex-col flex-1 overflow-hidden">

        <CodeMirror
          ref={editorRef}
          value={content}
          height="100%"
          basicSetup={{ defaultKeymap: false }}
          extensions={extensions}
          theme={editorThemes[config.theme]}
          onChange={handleChange}
          className="flex-1 overflow-auto"
        />

        <EditorStatusBar
          position={position}
          config={config}
          onConfigChange={handleConfigChange}
          className="flex-shrink-0"
        />
      </div>
    </div>
  )
}

NoteEditor.propTypes = {
  content: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}

export default NoteEditor
