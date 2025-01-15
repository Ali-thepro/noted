import { Select } from 'flowbite-react'
import PropTypes from 'prop-types'

const EditorStatusBar = ({
  position = { line: 1, column: 1 },
  keymap = 'default',
  indentWithTabs = false,
  tabSize = 2,
  onKeymapChange,
  onIndentationChange
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 text-sm border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800 sticky bottom-0">
      <div className="flex items-center space-x-4">
        {/* Keymap selector */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">Keymap:</span>
          <Select
            className="ring-0 focus:ring-0"
            value={keymap}
            onChange={(e) => onKeymapChange(e.target.value)}
            size="sm"
          >
            <option value="default">Default</option>
            <option value="vim">Vim</option>
            <option value="emacs">Emacs</option>
            <option value="vscode">VSCode</option>
          </Select>
        </div>

        {/* Indentation type */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">Indent:</span>
          <Select
            className="ring-0 focus:ring-0"
            value={indentWithTabs ? 'tabs' : 'spaces'}
            onChange={(e) => onIndentationChange({
              type: e.target.value,
              size: tabSize
            })}
            size="sm"
          >
            <option value="tabs">Tabs</option>
            <option value="spaces">Spaces</option>
          </Select>
        </div>

        {/* Tab size */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">Size:</span>
          <Select
            className="ring-0 focus:ring-0"
            value={tabSize}
            onChange={(e) => onIndentationChange({
              type: indentWithTabs ? 'tabs' : 'spaces',
              size: Number(e.target.value)
            })}
            size="sm"
          >
            <option value="2">2</option>
            <option value="4">4</option>
            <option value="8">8</option>
          </Select>
        </div>
      </div>

      {/* Cursor position */}
      <div className="text-gray-500">
        Line {position.line}, Column {position.column}
      </div>
    </div>
  )
}

EditorStatusBar.propTypes = {
  position: PropTypes.object.isRequired,
  keymap: PropTypes.string.isRequired,
  indentWithTabs: PropTypes.bool.isRequired,
  tabSize: PropTypes.number.isRequired,
  onKeymapChange: PropTypes.func.isRequired,
  onIndentationChange: PropTypes.func.isRequired
}

export default EditorStatusBar