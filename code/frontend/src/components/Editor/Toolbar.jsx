import { useState } from 'react'
import ImageUploader from './ImageUploader'
import { Button, Tooltip } from 'flowbite-react'
import {
  FaBold, FaItalic, FaLink, FaImage,
  FaListUl, FaListOl, FaCode, FaQuoteLeft,
  FaStrikethrough, FaHeading, FaCheckSquare,
  FaTable, FaMinus, FaComment, FaUpload
} from 'react-icons/fa'
import PropTypes from 'prop-types'

const toolbarItems = [
  { action: 'header', icon: <FaHeading />, tooltip: 'Add Heading', id: 'header-button', prefix: '# ', suffix: '' },
  { action: 'bold', icon: <FaBold />, tooltip: 'Bold Text', id: 'bold-button', prefix: '**', suffix: '**' },
  { action: 'italic', icon: <FaItalic />, tooltip: 'Italic Text', id: 'italic-button', prefix: '_', suffix: '_' },
  { action: 'strikethrough', icon: <FaStrikethrough />, tooltip: 'Strikethrough Text', id: 'strikethrough-button', prefix: '~~', suffix: '~~' },
  { action: 'link', icon: <FaLink />, tooltip: 'Insert Link', id: 'link-button', prefix: '[', suffix: '](url)' },
  { action: 'image', icon: <FaImage />, tooltip: 'Upload Image', id: 'image-button', prefix: '![', suffix: '](url)' },
  { action: 'upload', icon: <FaUpload />, tooltip: 'Upload File', id: 'upload-button' },
  { action: 'ul', icon: <FaListUl />, tooltip: 'Unordered List', id: 'ul-button', prefix: '- ', suffix: '' },
  { action: 'ol', icon: <FaListOl />, tooltip: 'Ordered List', id: 'ol-button', prefix: '1. ', suffix: '' },
  { action: 'checklist', icon: <FaCheckSquare />, tooltip: 'Checklist', id: 'checklist-button', prefix: '- [ ] ', suffix: '' },
  { action: 'code', icon: <FaCode />, tooltip: 'Code Block', id: 'code-button', prefix: '```\n', suffix: '\n```' },
  { action: 'quote', icon: <FaQuoteLeft />, tooltip: 'Quote Block', id: 'quote-button', prefix: '> ', suffix: '' },
  { action: 'table', icon: <FaTable />, tooltip: 'Insert Table', id: 'table-button', prefix: '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |', suffix: '' },
  { action: 'line', icon: <FaMinus />, tooltip: 'Horizontal Line', id: 'line-button', prefix: '\n---\n', suffix: '' },
  { action: 'comment', icon: <FaComment />, tooltip: 'Add Comment', id: 'comment-button', prefix: '<!-- ', suffix: ' -->' }
]

const Toolbar = ({ onAction }) => {
  const [showImageUploader, setShowImageUploader] = useState(false)

  const handleMarkdownAction = (item) => {
    if (item.action === 'upload') {
      setShowImageUploader(true)
      return
    }

    onAction({ prefix: item.prefix, suffix: item.suffix })
  }

  const handleImageUpload = (response) => {
    if (response.imageUrl) {
      onAction({ prefix: '![', suffix: `](${response.imageUrl})` })
      setShowImageUploader(false)
    }
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
                onClick={() => handleMarkdownAction(item)}
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
      {showImageUploader && (
        <ImageUploader
          onUpload={handleImageUpload}
          onClose={() => setShowImageUploader(false)}
        />
      )}
    </div>
  )
}

Toolbar.propTypes = {
  onAction: PropTypes.func.isRequired
}

export default Toolbar
