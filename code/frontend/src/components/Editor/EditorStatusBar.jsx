import { Select } from 'flowbite-react'
import PropTypes from 'prop-types'

const EditorStatusBar = ({
  position,
  config,
  onConfigChange
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 text-sm border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800 sticky bottom-0">
      <div className="flex items-center space-x-4">
        {/* Mapping selector */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">Mapping:</span>
          <Select
            className="ring-0 focus:ring-0"
            value={config.mapping}
            onChange={(e) => onConfigChange({ mapping: e.target.value })}
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
            value={config.indent}
            onChange={(e) => onConfigChange({ indent: e.target.value })}
            size="sm"
          >
            <option value="tabs">Tabs</option>
            <option value="spaces">Spaces</option>
          </Select>
        </div>

        {/* Indent size */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">Size:</span>
          <Select
            className="ring-0 focus:ring-0"
            value={config.indentSize}
            onChange={(e) => onConfigChange({ indentSize: Number(e.target.value) })}
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
  position: PropTypes.shape({
    line: PropTypes.number.isRequired,
    column: PropTypes.number.isRequired
  }).isRequired,
  onConfigChange: PropTypes.func.isRequired
}

export default EditorStatusBar