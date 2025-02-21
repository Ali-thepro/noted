import { Button, ButtonGroup } from 'flowbite-react'
import { FaSortAlphaDown, FaSortAlphaUp, FaClock } from 'react-icons/fa'
import PropTypes from 'prop-types'

const SortControls = ({ sortBy, sortOrder, onSortByChange, onSortOrderChange }) => {
  const toggleSortOrder = () => {
    onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')
  }

  return (
    <div className="flex gap-2">
      <ButtonGroup>
        <Button
          color="gray"
          className="focus:ring-0"
          onClick={() => onSortByChange('title')}
          gradientDuoTone={sortBy === 'title' ? 'purpleToBlue' : undefined}
        >
          <FaSortAlphaDown className="mr-2 mt-1" />
          Title
        </Button>
        <Button
          color="gray"
          className="focus:ring-0"
          onClick={() => onSortByChange('date')}
          gradientDuoTone={sortBy === 'date' ? 'purpleToBlue' : undefined}
        >
          <FaClock className="mr-2 mt-1" />
          Date
        </Button>
      </ButtonGroup>

      <Button
        color="gray"
        className="focus:ring-0"
        onClick={toggleSortOrder}
      >
        {sortOrder === 'asc' ? <FaSortAlphaUp className='mt-1 '/> : <FaSortAlphaDown className='mt-1'/>}
      </Button>
    </div>
  )
}

SortControls.propTypes = {
  sortBy: PropTypes.oneOf(['title', 'date']).isRequired,
  sortOrder: PropTypes.oneOf(['asc', 'desc']).isRequired,
  onSortByChange: PropTypes.func.isRequired,
  onSortOrderChange: PropTypes.func.isRequired
}

export default SortControls
