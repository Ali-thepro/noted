import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '../test-utils'
import EditorStatusBar from '../../src/components/Editor/EditorStatusBar'

describe('EditorStatusBar', () => {
  const defaultProps = {
    position: { line: 1, column: 1 },
    config: {
      mapping: 'default',
      indent: 'spaces',
      indentSize: 2,
      theme: 'light',
      fontFamily: 'monospace',
      fontSize: 14
    },
    onConfigChange: () => {}
  }

  describe('Rendering', () => {
    it('renders all editor options', () => {
      render(<EditorStatusBar {...defaultProps} />)

      expect(screen.getByText('Theme:')).toBeInTheDocument()
      expect(screen.getByText('Font:')).toBeInTheDocument()
      expect(screen.getByText('Size:')).toBeInTheDocument()
      expect(screen.getByText('Mapping:')).toBeInTheDocument()
      expect(screen.getByText('Tab Size:')).toBeInTheDocument()
      expect(screen.getByText('Spaces')).toBeInTheDocument()
      expect(screen.getByText('Ln 1, Col 1')).toBeInTheDocument()
    })
  })
})
