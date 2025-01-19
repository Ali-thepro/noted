import { TextInput } from 'flowbite-react'
import { FaSearch } from 'react-icons/fa'
import PropTypes from 'prop-types'

const SearchBar = ({ value, onSearch }) => {
  const handleSearch = (e) => {
    const inputValue = e.target.value
    onSearch(inputValue)
  }

  return (
    <TextInput
      type="text"
      icon={FaSearch}
      value={value}
      onChange={handleSearch}
      placeholder="Search notes..."
      className="w-full"
    />
  )
}

SearchBar.propTypes = {
  value: PropTypes.string.isRequired,
  onSearch: PropTypes.func.isRequired
}

export default SearchBar
