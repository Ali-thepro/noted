import { TextInput } from 'flowbite-react'
import { FaSearch, FaTags } from 'react-icons/fa'
import PropTypes from 'prop-types'

const SearchBar = ({ keyword, onKeywordChange, tag, onTagChange }) => {

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <TextInput
        type="text"
        icon={FaSearch}
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        placeholder="Search by keyword..."
        className="w-full"
      />
      <TextInput
        type="text"
        icon={FaTags}
        value={tag}
        onChange={(e) => onTagChange(e.target.value)}
        placeholder="Filter by tag..."
        className="w-full"
      />
    </div>
  )
}

SearchBar.propTypes = {
  keyword: PropTypes.string.isRequired,
  onKeywordChange: PropTypes.func.isRequired,
  tag: PropTypes.string.isRequired,
  onTagChange: PropTypes.func.isRequired
}

export default SearchBar
