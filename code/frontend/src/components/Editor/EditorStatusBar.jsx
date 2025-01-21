import PropTypes from 'prop-types'
import editorFonts from '../../utils/fonts'
import { editorThemes } from '../../utils/themes'


const EDITOR_OPTIONS = [
  {
    key: 'theme',
    label: 'Theme',
    options: Object.keys(editorThemes).map(theme => ({
      value: theme,
      label: theme
    }))
  },
  {
    key: 'fontFamily',
    label: 'Font',
    options: editorFonts.map(font => ({
      value: font,
      label: font
    }))
  },
  {
    key: 'fontSize',
    label: 'Size',
    options: Array.from({ length: 13 }, (_, i) => ({
      value: String(i + 12),
      label: String(i + 12)
    }))
  },
  {
    key: 'mapping',
    label: 'Mapping',
    options: [
      { value: 'default', label: 'Default' },
      { value: 'vim', label: 'Vim' },
      { value: 'emacs', label: 'Emacs' },
      { value: 'vscode', label: 'VSCode' }
    ]
  },
  {
    key: 'indentSize',
    label: 'Tab Size',
    options: [
      { value: '2', label: '2' },
      { value: '4', label: '4' },
      { value: '8', label: '8' }
    ]
  },
  {
    key: 'indent',
    label: 'Indent',
    options: [
      { value: 'tabs', label: 'Tabs' },
      { value: 'spaces', label: 'Spaces' }
    ]
  },
]


const EditorStatusBar = ({ position, config, onConfigChange }) => {
  const handleChange = (key) => (e) => {
    const value = ['indentSize', 'fontSize'].includes(key)
      ? Number(e.target.value)
      : e.target.value
    onConfigChange({ [key]: value })
  }

  const handleIndentToggle = () => {
    onConfigChange({ indent: config.indent === 'spaces' ? 'tabs' : 'spaces' })
  }

  return (
    <div className="flex items-center justify-between px-3 py-2 text-sm border-t dark:border-gray-700 bg-gray-50 dark:bg-[rgb(30,33,34)] sticky bottom-0">
      <div className="flex items-center gap-2 overflow-x-auto">
        {EDITOR_OPTIONS.map(({ key, label, options }) => (
          <div key={key} className="flex items-center gap-1 shrink-0">
            {key === 'indent' ? (
              <button
                onClick={handleIndentToggle}
                className="text-xs hover:underline px-1.5 py-0.5"
              >
                {config.indent === 'spaces' ? 'Spaces' : 'Tabs'}
              </button>
            ) : (
              <>
                <span className="text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">{label}:</span>
                <select
                  value={String(config[key])}
                  onChange={handleChange(key)}
                  className="rounded bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 text-xs form-select"
                >
                  {options.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap pl-2">
        Ln {position.line}, Col {position.column}
      </div>
    </div>
  )
}

EditorStatusBar.propTypes = {
  position: PropTypes.shape({
    line: PropTypes.number.isRequired,
    column: PropTypes.number.isRequired
  }).isRequired,
  config: PropTypes.shape({
    mapping: PropTypes.string.isRequired,
    indent: PropTypes.string.isRequired,
    indentSize: PropTypes.number.isRequired,
    theme: PropTypes.string.isRequired,
    fontFamily: PropTypes.string.isRequired,
    fontSize: PropTypes.number.isRequired
  }).isRequired,
  onConfigChange: PropTypes.func.isRequired
}

export default EditorStatusBar
