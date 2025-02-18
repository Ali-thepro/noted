import { vi } from 'vitest'
import { forwardRef } from 'react'
import { screen, waitFor } from '@testing-library/react'
import { render } from '../test-utils'
import VersionHistoryModal from '../../src/components/Version/VersionHistoryModal'
import { getVersions, getVersionChain } from '../../src/services/version'
import userEvent from '@testing-library/user-event'
//import memoryStore from '../../src/utils/memoryStore'

// Mock memoryStore
vi.mock('../../src/utils/memoryStore', () => ({
  default: {
    get: vi.fn(() => 'mockSymmetricKey')
  }
}))

// Mock CodeMirror
vi.mock('@uiw/react-codemirror', () => ({
  default: forwardRef(function CodeMirrorMock(props, ref) {
    return (
      <div ref={ref} data-testid="editor">
        {props.value} {/* eslint-disable-line */}
      </div>
    )
  })
}))

// Mock diff viewer
vi.mock('react-diff-viewer-continued', () => ({
  default: ({ oldValue, newValue }) => (
    <div data-testid="diff-viewer">
      <div>Old: {oldValue}</div>
      <div>New: {newValue}</div>
    </div>
  ),
  DiffMethod: {
    WORDS: 'WORDS'
  }
}))

vi.mock('../../src/services/version')

// Mock encryption service
vi.mock('../../src/utils/encryption', () => ({
  EncryptionService: class {
    decryptNoteContent = vi.fn().mockResolvedValue('decrypted content')
    unwrapNoteCipherKey = vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]))
  }
}))

const mockVersions = [
  {
    id: 'v1',
    type: 'snapshot',
    content: 'Version 1 content',
    cipherKey: 'key1',
    cipherIv: 'iv1',
    contentIv: 'contentIv1',
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
    cipherKey: 'key2',
    cipherIv: 'iv2',
    contentIv: 'contentIv2',
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
  note: {
    id: '123',
    title: 'Test Note',
    cipherKey: 'noteKey',
    cipherIv: 'noteIv'
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
      render(<VersionHistoryModal {...defaultProps} />)
      expect(screen.getByRole('status')).toBeInTheDocument()
      await waitFor(() => {
        expect(getVersions).toHaveBeenCalledWith('123')
      })
    })

    it('loads and displays versions when modal is shown', async () => {
      render(<VersionHistoryModal {...defaultProps} />)

      await waitFor(() => {
        const versionTitles = screen.getAllByText(/Test Note v[12]/i)
        expect(versionTitles).toHaveLength(2)
      })
    })
  })

  describe('Version Interaction', () => {
    it('handles version selection and comparison', async () => {
      const user = userEvent.setup()
      render(<VersionHistoryModal {...defaultProps} />)


      await waitFor(() => {
        const versionButton = screen.getByText(/Test Note v1/i)
        expect(versionButton).toBeInTheDocument()
      })

      const versionButton = screen.getByText(/Test Note v1/i)
      await user.click(versionButton)

      const compareButton = screen.getByRole('button', {
        name: /compare/i,
        exact: false
      })
      await user.click(compareButton)

      await waitFor(() => {
        expect(screen.getByTestId('diff-viewer')).toBeInTheDocument()
      })
    })

    it('enables compare button when version is selected', async () => {
      const user = userEvent.setup()
      render(<VersionHistoryModal {...defaultProps} />)

      await waitFor(() => {
        const versionButton = screen.getByText(/Test Note v1/i)
        expect(versionButton).toBeInTheDocument()
      })

      const compareButton = screen.getByRole('button', {
        name: /compare/i,
        exact: false
      })

      const versionButton = screen.getByText(/Test Note v1/i)
      await user.click(versionButton)

      await waitFor(() => {
        expect(compareButton).toBeEnabled()
      })
    })
  })
})
