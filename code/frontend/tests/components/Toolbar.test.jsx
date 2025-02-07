import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '../test-utils'
import userEvent from '@testing-library/user-event'
import Toolbar from '../../src/components/Editor/Toolbar'


// Mock ImageUploader component
vi.mock('../../src/components/Editor/ImageUploader', () => ({
  default: ({ onUpload, onClose }) => (
    <div data-testid="image-uploader">
      <button onClick={() => onUpload({ imageUrl: 'test.jpg' })}>Upload</button>
      <button onClick={onClose}>Close</button>
    </div>
  )
}))

describe('Toolbar', () => {
  const defaultProps = {
    onAction: vi.fn()
  }

  describe('Basic Rendering', () => {
    it('renders basic formatting buttons', () => {
      render(<Toolbar {...defaultProps} />)

      // Check basic formatting buttons using tooltip content
      expect(screen.getByText('Bold')).toBeInTheDocument()
      expect(screen.getByText('Italic')).toBeInTheDocument()
      expect(screen.getByText('Heading')).toBeInTheDocument()
    })
  })

  describe('Basic Actions', () => {
    it('handles bold button click', async () => {
      const user = userEvent.setup()
      render(<Toolbar {...defaultProps} />)

      // Find button using data-testid
      const boldButton = screen.getByTestId('toolbar-bold')
      await user.click(boldButton)

      expect(defaultProps.onAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'bold',
          prefix: '**',
          suffix: '**'
        })
      )
    })
  })
})
