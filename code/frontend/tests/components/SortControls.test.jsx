import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../test-utils'
import SortControls from '../../src/components/Notes/SortControls'

describe('SortControls Component', () => {
  const mockProps = {
    sortBy: 'title',
    sortOrder: 'asc',
    onSortByChange: vi.fn(),
    onSortOrderChange: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all sort buttons', () => {
    render(<SortControls {...mockProps} />)

    expect(screen.getByRole('button', { name: /title/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /date/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '' })).toBeInTheDocument()
  })

  it('highlights active sort button', () => {
    render(<SortControls {...mockProps} />)

    const dateButton = screen.getByRole('button', { name: /date/i })
    expect(dateButton).not.toHaveClass('purpleToBlue')
  })

  it('calls onSortByChange when clicking sort buttons', async () => {
    render(<SortControls {...mockProps} />)

    await userEvent.click(screen.getByRole('button', { name: /date/i }))
    expect(mockProps.onSortByChange).toHaveBeenCalledWith('date')
  })

  it('calls onSortOrderChange when clicking order toggle', async () => {
    render(<SortControls {...mockProps} />)

    await userEvent.click(screen.getByRole('button', { name: '' }))
    expect(mockProps.onSortOrderChange).toHaveBeenCalledWith('desc')
  })
})
