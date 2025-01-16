import { Button, Tooltip } from 'flowbite-react'
import {
  FaBold, FaItalic, FaLink, FaImage,
  FaListUl, FaListOl, FaCode, FaQuoteLeft,
  FaStrikethrough, FaHeading, FaCheckSquare,
  FaTable, FaMinus, FaComment, FaUpload
} from 'react-icons/fa'
import PropTypes from 'prop-types'

const toolbarItems = [
  { action: 'header', icon: <FaHeading />, tooltip: 'Add Heading', id: 'header-button' },
  { action: 'bold', icon: <FaBold />, tooltip: 'Bold Text', id: 'bold-button' },
  { action: 'italic', icon: <FaItalic />, tooltip: 'Italic Text', id: 'italic-button' },
  { action: 'strikethrough', icon: <FaStrikethrough />, tooltip: 'Strikethrough Text', id: 'strikethrough-button' },
  { action: 'link', icon: <FaLink />, tooltip: 'Insert Link', id: 'link-button' },
  { action: 'image', icon: <FaImage />, tooltip: 'Upload Image', id: 'image-button' },
  { action: 'upload', icon: <FaUpload />, tooltip: 'Upload File', id: 'upload-button' },
  { action: 'ul', icon: <FaListUl />, tooltip: 'Unordered List', id: 'ul-button' },
  { action: 'ol', icon: <FaListOl />, tooltip: 'Ordered List', id: 'ol-button' },
  { action: 'checklist', icon: <FaCheckSquare />, tooltip: 'Checklist', id: 'checklist-button' },
  { action: 'code', icon: <FaCode />, tooltip: 'Code Block', id: 'code-button' },
  { action: 'quote', icon: <FaQuoteLeft />, tooltip: 'Quote Block', id: 'quote-button' },
  { action: 'table', icon: <FaTable />, tooltip: 'Insert Table', id: 'table-button' },
  { action: 'line', icon: <FaMinus />, tooltip: 'Horizontal Line', id: 'line-button' },
  { action: 'comment', icon: <FaComment />, tooltip: 'Add Comment', id: 'comment-button' }
]

const Toolbar = ({ onAction }) => {
  const handleMarkdownAction = (action) => {
    const actions = {
      header: { prefix: '# ', suffix: '' },
      bold: { prefix: '**', suffix: '**' },
      italic: { prefix: '_', suffix: '_' },
      strikethrough: { prefix: '~~', suffix: '~~' },
      link: { prefix: '[', suffix: '](url)' },
      image: { prefix: '![', suffix: '](url)' },
      upload: { prefix: '![', suffix: '](url)' },
      ul: { prefix: '- ', suffix: '' },
      ol: { prefix: '1. ', suffix: '' },
      checklist: { prefix: '- [ ] ', suffix: '' },
      code: { prefix: '```\n', suffix: '\n```' },
      quote: { prefix: '> ', suffix: '' },
      table: { prefix: '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |', suffix: '' },
      line: { prefix: '\n---\n', suffix: '' },
      comment: { prefix: '<!-- ', suffix: ' -->' }
    }

    onAction(actions[action])
  }

  return (
    <div className="p-2 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="overflow-x-auto">
        <div className="inline-flex min-w-max">
          {toolbarItems.map((item, index) => (
            <Tooltip
              key={item.action}
              content={item.tooltip}
            >
              <Button
                color="gray"
                size="sm"
                onClick={() => handleMarkdownAction(item.action)}
                className={`
                  focus:ring-0
                  ${index === 0 ? 'rounded-l-lg rounded-r-none' : ''}
                  ${index === toolbarItems.length - 1 ? 'rounded-r-lg rounded-l-none' : ''}
                  ${index !== 0 && index !== toolbarItems.length - 1 ? 'rounded-none' : ''}
                  ${index !== 0 ? '-ml-px' : ''}
                `}
                id={item.id}
              >
                {item.icon}
              </Button>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  )
}

Toolbar.propTypes = {
  onAction: PropTypes.func.isRequired
}

export default Toolbar
