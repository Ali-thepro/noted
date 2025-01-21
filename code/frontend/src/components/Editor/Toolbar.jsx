import { useState } from 'react'
import ImageUploader from './ImageUploader'
import { Button, Tooltip } from 'flowbite-react'
import {
  FaBold, FaItalic, FaLink, FaImage,
  FaListUl, FaListOl, FaCode, FaQuoteLeft,
  FaStrikethrough, FaHeading, FaCheckSquare,
  FaTable, FaMinus, FaComment, FaUpload, FaUnderline,
  FaSubscript, FaSuperscript, FaHighlighter
} from 'react-icons/fa'
import PropTypes from 'prop-types'

const toolbarItems = [
  { action: 'header', icon: <FaHeading />, tooltip: 'Add Heading', prefix: '# ', suffix: '' },
  { action: 'bold', icon: <FaBold />, tooltip: 'Bold', prefix: '**', suffix: '**' },
  { action: 'italic', icon: <FaItalic />, tooltip: 'Italic', prefix: '*', suffix: '*' },
  { action: 'strikethrough', icon: <FaStrikethrough />, tooltip: 'Strikethrough', prefix: '~~', suffix: '~~' },
  { action: 'underline', icon: <FaUnderline />, tooltip: 'Underline', prefix: '++', suffix: '++' },
  { action: 'subscript', icon: <FaSubscript />, tooltip: 'Subscript', prefix: '<sub>', suffix: '</sub>' },
  { action: 'superscript', icon: <FaSuperscript />, tooltip: 'Superscript', prefix: '<sup>', suffix: '</sup>' },
  { action: 'highlight', icon: <FaHighlighter />, tooltip: 'Highlight', prefix: '==', suffix: '==' },
  { action: 'link', icon: <FaLink />, tooltip: 'Insert Link', prefix: '[', suffix: '](url)' },
  { action: 'image', icon: <FaImage />, tooltip: 'Upload Image', prefix: '![', suffix: '](url)' },
  { action: 'upload', icon: <FaUpload />, tooltip: 'Upload File' },
  { action: 'ul', icon: <FaListUl />, tooltip: 'Unordered List', prefix: '- ', suffix: '' },
  { action: 'ol', icon: <FaListOl />, tooltip: 'Ordered List', prefix: '1. ', suffix: '' },
  { action: 'checklist', icon: <FaCheckSquare />, tooltip: 'Checklist', prefix: '- [ ] ', suffix: '' },
  { action: 'code', icon: <FaCode />, tooltip: 'Code', prefix: '```', suffix: '```' },
  { action: 'quote', icon: <FaQuoteLeft />, tooltip: 'Quote', prefix: '> ', suffix: '' },
  { action: 'table', icon: <FaTable />, tooltip: 'Insert Table', prefix: '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |', suffix: '' },
  { action: 'line', icon: <FaMinus />, tooltip: 'Line Break', prefix: '\n---\n', suffix: '' },
  { action: 'comment', icon: <FaComment />, tooltip: 'Comment', prefix: '<!-- ', suffix: ' -->' }
]

const Toolbar = ({ onAction }) => {
  const [showImageUploader, setShowImageUploader] = useState(false)

  const handleMarkdownAction = (item) => {
    if (item.action === 'upload') {
      setShowImageUploader(true)
      return
    }

    onAction(item)
  }

  const handleImageUpload = (response) => {
    if (response.imageUrl) {
      onAction({ prefix: '![', suffix: `](${response.imageUrl})` })
      setShowImageUploader(false)
    }
  }

  return (
    <div className="p-2 border-b dark:border-gray-700 bg-white dark:bg-[rgb(30,33,34)]">
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
