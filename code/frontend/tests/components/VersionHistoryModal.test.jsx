import { vi } from 'vitest'
import { forwardRef } from 'react'
import { screen, waitFor } from '@testing-library/react'
import { render } from '../test-utils'
import VersionHistoryModal from '../../src/components/Version/VersionHistoryModal'
import { getVersions, getVersionChain } from '../../src/services/version'
import userEvent from '@testing-library/user-event'


vi.mock('@uiw/react-codemirror', () => ({
  default: forwardRef(function CodeMirrorMock(props, ref) {
    return (
      <div ref={ref} data-testid="editor">
        Mocked Editor
      </div>
    )
  })
}))


vi.mock('react-diff-viewer-continued', () => ({
  default: () => <div data-testid="diff-viewer">Diff Viewer</div>,
  DiffMethod: {
    CHARS: 'CHARS',
    WORDS: 'WORDS',
    LINES: 'LINES',
    SENTENCES: 'SENTENCES',
    CSS: 'CSS',
    JSON: 'JSON',
    TRIMMED: 'TRIMMED'
  }
}))


vi.mock('../../src/services/version')

const mockVersions = [
  {
    id: 'v1',
    type: 'snapshot',
    content: 'Version 1 content',
    createdAt: '2024-03-20T10:00:00Z',
    metadata: {
      title: 'Test Note v1',
      tags: ['test'],
      versionNumber: 1
    }
  },
  {
    id: 'v2',
    type: 'snapshot',
    content: 'Version 2 content',
    createdAt: '2024-03-19T10:00:00Z',
    metadata: {
      title: 'Test Note v2',
      tags: ['test'],
      versionNumber: 2
    }
  }
]

const defaultProps = {
  show: true,
  onClose: vi.fn(),
  note: { id: '123', title: 'Test Note' }
}

const defaultState = {
  auth: { user: { id: '1', username: 'testuser' } },
  note: {
    activeNote: {
      id: '123',
      title: 'Test Note',
      content: '# Test Content'
    }
  },
  theme: 'light',
  editorConfig: {
    fontSize: 14,
    fontFamily: 'monospace',
    theme: 'light'
  }
}

describe('VersionHistoryModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getVersions.mockResolvedValue(mockVersions)
    getVersionChain.mockResolvedValue([mockVersions[0]])
  })

  describe('Loading States', () => {
    it('shows loading state initially', async () => {
      render(<VersionHistoryModal {...defaultProps} />, {
        preloadedState: defaultState
      })

      expect(screen.getByRole('status')).toBeInTheDocument()


      await waitFor(() => {
        expect(getVersions).toHaveBeenCalledWith('123')
      })
    })

    it('loads and displays versions when modal is shown', async () => {
      render(<VersionHistoryModal {...defaultProps} />, {
        preloadedState: defaultState
      })

      await waitFor(() => {
        expect(screen.getByText('Test Note v1')).toBeInTheDocument()
        expect(screen.getByText('Test Note v2')).toBeInTheDocument()
      })
    })
  })



  it('handles version comparison', async () => {
    const user = userEvent.setup()

    render(<VersionHistoryModal {...defaultProps} />, {
      preloadedState: defaultState
    })

    await waitFor(() => {
      expect(screen.getByText('Compare')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Compare'))

    await waitFor(() => {
      expect(screen.getByText('Show Content')).toBeInTheDocument()
    })
  })
})

describe('Modal Controls', () => {
  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<VersionHistoryModal {...defaultProps} onClose={onClose} />, {
      preloadedState: defaultState
    })

    await waitFor(() => {
      expect(screen.getByText('Close')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Close'))
    expect(onClose).toHaveBeenCalled()
  })
})
