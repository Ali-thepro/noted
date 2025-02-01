import { screen } from '@testing-library/react'
import { render } from './test-utils'
import About from '../src/pages/About'

describe('About Component', () => {
  it('renders the welcome and features paragraphs', () => {
    render(<About />)

    // Check for the welcome paragraph
    expect(screen.getByText(/Welcome to Noted! This platform is designed for students, professionals/i))
      .toBeInTheDocument()

    // Check for the features paragraph
    expect(screen.getByText(/Noted empowers users with Markdown-based notes, real-time collaboration/i))
      .toBeInTheDocument()
  })
})
