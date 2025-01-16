import { Button, ButtonGroup } from 'flowbite-react'
import {
  FaBold, FaItalic, FaLink, FaImage,
  FaListUl, FaListOl, FaCode, FaQuoteLeft,
  FaStrikethrough, FaHeading, FaCheckSquare,
  FaTable, FaMinus, FaComment, FaUpload
} from 'react-icons/fa'
import PropTypes from 'prop-types'

const Toolbar = ({ onAction }) => {
  const handleMarkdownAction = (action) => {
    const actions = {
      header: { prefix: '# ', suffix: '' },
      bold: { prefix: '**', suffix: '**' },
      italic: { prefix: '_', suffix: '_' },
      strikethrough: { prefix: '~~', suffix: '~~' },
      link: { prefix: '[', suffix: '](url)' },
      image: { prefix: '![', suffix: '](url)', custom: true },
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
      <ButtonGroup>
        <Button color="gray" size="sm" onClick={() => handleMarkdownAction('header')}>
          <FaHeading />
        </Button>
        <Button color="gray" size="sm" onClick={() => handleMarkdownAction('bold')}>
          <FaBold />
        </Button>
        <Button color="gray" size="sm" onClick={() => handleMarkdownAction('italic')}>
          <FaItalic />
        </Button>
        <Button color="gray" size="sm" onClick={() => handleMarkdownAction('strikethrough')}>
          <FaStrikethrough />
        </Button>
        <Button color="gray" size="sm" onClick={() => handleMarkdownAction('link')}>
          <FaLink />
        </Button>
        <Button color="gray" size="sm" onClick={() => handleMarkdownAction('image')}>
          <FaImage />
        </Button>
        <Button color="gray" size="sm" onClick={() => handleMarkdownAction('upload')}>
          <FaUpload />
        </Button>
        <Button color="gray" size="sm" onClick={() => handleMarkdownAction('ul')}>
          <FaListUl />
        </Button>
        <Button color="gray" size="sm" onClick={() => handleMarkdownAction('ol')}>
          <FaListOl />
        </Button>
        <Button color="gray" size="sm" onClick={() => handleMarkdownAction('checklist')}>
          <FaCheckSquare />
        </Button>
        <Button color="gray" size="sm" onClick={() => handleMarkdownAction('code')}>
          <FaCode />
        </Button>
        <Button color="gray" size="sm" onClick={() => handleMarkdownAction('quote')}>
          <FaQuoteLeft />
        </Button>
        <Button color="gray" size="sm" onClick={() => handleMarkdownAction('table')}>
          <FaTable />
        </Button>
        <Button color="gray" size="sm" onClick={() => handleMarkdownAction('line')}>
          <FaMinus />
        </Button>
        <Button color="gray" size="sm" onClick={() => handleMarkdownAction('comment')}>
          <FaComment />
        </Button>
      </ButtonGroup>
    </div>
  )
}

Toolbar.propTypes = {
  onAction: PropTypes.func.isRequired
}

export default Toolbar