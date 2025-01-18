import { useCallback, useState, useRef } from 'react'
import EditorStatusBar from './EditorStatusBar'
import { updateConfig } from '../../redux/reducers/editorConfigReducer'
import PropTypes from 'prop-types'
import CodeMirror from '@uiw/react-codemirror'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { EditorView } from '@codemirror/view'
import { indentUnit } from '@codemirror/language'
import { vim } from '@replit/codemirror-vim'
import { emacs } from '@replit/codemirror-emacs'
import { vscodeKeymap } from '@replit/codemirror-vscode-keymap'
import { indentWithTab } from '@codemirror/commands'
import { keymap as keymapView } from '@codemirror/view'
import { defaultKeymap } from '@codemirror/commands'
import { oneDark } from '@codemirror/theme-one-dark'
import { useSelector, useDispatch } from 'react-redux'
import { python } from '@codemirror/lang-python'
import { javascript } from '@codemirror/lang-javascript'
import { sql } from '@codemirror/lang-sql'
import { xml } from '@codemirror/lang-xml'
import { css } from '@codemirror/lang-css'
import { yaml } from '@codemirror/lang-yaml'
import { go } from '@codemirror/lang-go'
import Toolbar from './Toolbar'

const editorTheme = EditorView.theme({
  '&': {
    fontSize: '16px',
    fontFamily: '"Fira Code", monospace'
  },
  '.cm-content': {
    fontFamily: '"Fira Code", monospace'
  },
  '.cm-line': {
    padding: '0 4px'
  }
})

const NoteEditor = ({ content, onChange }) => {
  const dispatch = useDispatch()
  const theme = useSelector(state => state.theme)
  const [position, setPosition] = useState({ line: 1, column: 1 })
  const config = useSelector(state => state.editorConfig)
  const editorRef = useRef(null)

  const getKeymapExtension = (type) => {
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
  }

  const handleToolbarAction = useCallback((actionObj) => {
    const view = editorRef.current?.view
    if (!view) return

    const { state } = view
    const { from, to } = state.selection.main
    const selectedText = state.sliceDoc(from, to)

    if (actionObj.action === 'header' || actionObj.action === 'quote' ||
        actionObj.action === 'ul' || actionObj.action === 'ol' ||
        actionObj.action === 'checklist' || actionObj.action === 'table' ||
        actionObj.action === 'line') {

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


  const handleConfigChange = useCallback((newConfig) => {
    dispatch(updateConfig(newConfig))
  }, [dispatch])

  const tabKeymap = keymapView.of([{
    key: 'Tab',
    run: indentWithTab
  }])

  const indentationExtensions = [
    indentUnit.of(' '.repeat(config.indentSize)),
    tabKeymap
  ]

  const handleChange = useCallback((value, viewUpdate) => {
    onChange(value)

    const pos = viewUpdate.state.selection.main.head
    const line = viewUpdate.state.doc.lineAt(pos)
    setPosition({
      line: line.number,
      column: pos - line.from + 1
    })
  }, [onChange])

  return (
    <div className="h-full flex flex-col">
      <Toolbar onAction={handleToolbarAction} />
      <CodeMirror
        ref={editorRef}
        value={content}
        height="100%"
        basicSetup={{ defaultKeymap: false }}
        extensions={[
          markdown({ base: markdownLanguage, codeLanguages: languages }),
          editorTheme,
          python(),
          javascript(),
          sql(),
          xml(),
          css(),
          yaml(),
          go(),
          getKeymapExtension(config.mapping),
          EditorView.lineWrapping,
          ...indentationExtensions
        ]}
        theme={theme === 'dark' ? oneDark : undefined}
        onChange={handleChange}
        className="flex-1 overflow-auto"
      />
      <EditorStatusBar
        position={position}
        config={config}
        onConfigChange={handleConfigChange}
      />
    </div>
  )
}

NoteEditor.propTypes = {
  content: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}

export default NoteEditor
