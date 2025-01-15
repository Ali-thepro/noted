import { Button, ButtonGroup } from 'flowbite-react'
import {
  FaBold, FaItalic, FaLink, FaImage,
  FaListUl, FaListOl, FaCode, FaQuoteLeft,
} from 'react-icons/fa'
import PropTypes from 'prop-types'

const Toolbar = ({ onAction }) => {


  const handleMarkdownAction = (action) => {
    const actions = {
      bold: { prefix: '**', suffix: '**' },
      italic: { prefix: '_', suffix: '_' },
      link: { prefix: '[', suffix: '](url)' },
      image: { prefix: '![', suffix: '](url)' },
      ul: { prefix: '- ', suffix: '' },
      ol: { prefix: '1. ', suffix: '' },
      code: { prefix: '```\n', suffix: '\n```' },
      quote: { prefix: '> ', suffix: '' }
    }

    onAction(actions[action])
  }


  return (
    <div className="p-2 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
      <ButtonGroup>
        <Button color="gray" size="sm" onClick={() => handleMarkdownAction('bold')}>
          <FaBold />
        </Button>
        <Button color="gray" size="sm" onClick={() => handleMarkdownAction('italic')}>
          <FaItalic />
        </Button>
        <Button color="gray" size="sm" onClick={() => handleMarkdownAction('link')}>
          <FaLink />
        </Button>
        <Button color="gray" size="sm" onClick={() => handleMarkdownAction('image')}>
          <FaImage />
        </Button>
        <Button color="gray" size="sm" onClick={() => handleMarkdownAction('ul')}>
          <FaListUl />
        </Button>
        <Button color="gray" size="sm" onClick={() => handleMarkdownAction('ol')}>
          <FaListOl />
        </Button>
        <Button color="gray" size="sm" onClick={() => handleMarkdownAction('code')}>
          <FaCode />
        </Button>
        <Button color="gray" size="sm" onClick={() => handleMarkdownAction('quote')}>
          <FaQuoteLeft />
        </Button>
      </ButtonGroup>

    </div>
  )
}

Toolbar.propTypes = {
  onAction: PropTypes.func.isRequired
}

export default Toolbar