import { screen } from '@testing-library/react'
import { render } from '../test-utils'
import About from '../../src/pages/About'

describe('About Component', () => {
  it('renders the welcome and features paragraphs', () => {
    render(<About />)

    expect(screen.getByText(/A powerful Markdown note-taking application with advanced features, encryption and version control./i))
      .toBeInTheDocument()

  })
})
