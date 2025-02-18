import { describe, test, expect, beforeEach, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { render } from '../test-utils'
import UnlockModal from '../../src/components/Encryption/UnlockModal'
import { EncryptionService } from '../../src/utils/encryption'
import { getMasterPasswordHash, getProtectedSymmetricKey, getIv } from '../../src/services/encryption'
import memoryStore from '../../src/utils/memoryStore'

// Mock the required modules
vi.mock('../../src/utils/encryption', () => {
  const mockSecureCompare = vi.fn().mockResolvedValue(true)
  return {
    EncryptionService: class {
      hash = vi.fn().mockResolvedValue('hashedValue')
      generateMasterKey = vi.fn().mockResolvedValue('masterKeyValue')
      generateMasterPasswordHash = vi.fn().mockResolvedValue({ encoded: 'encodedValue' })
      secureCompare = mockSecureCompare
      hkdf = vi.fn().mockResolvedValue('stretchedKeyValue')
      decryptSymmetricKey = vi.fn().mockResolvedValue('decryptedKey')
    }
  }
})

vi.mock('../../src/services/encryption', () => ({
  getMasterPasswordHash: vi.fn().mockResolvedValue('storedHash'),
  getProtectedSymmetricKey: vi.fn().mockResolvedValue('protectedKey'),
  getIv: vi.fn().mockResolvedValue('ivValue')
}))

vi.mock('../../src/utils/memoryStore', () => ({
  default: {
    set: vi.fn()
  }
}))

describe('UnlockModal', () => {
  const mockOnClose = vi.fn()
  const defaultProps = {
    show: true,
    onClose: mockOnClose,
    email: 'test@example.com'
  }

  const preloadedState = {
    auth: {
      user: {
        email: 'test@example.com',
        username: 'testuser'
      }
    },
    theme: 'light'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders modal with correct elements', () => {
    render(<UnlockModal {...defaultProps} />, { preloadedState })
    
    expect(screen.getByText('Unlock Noted')).toBeDefined()
    expect(screen.getByLabelText(/master password/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /unlock/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /sign out/i })).toBeDefined()
  })

  test('successfully unlocks with correct password', async () => {
    render(<UnlockModal {...defaultProps} />, { preloadedState })
    
    const passwordInput = screen.getByLabelText(/master password/i)
    fireEvent.change(passwordInput, { target: { value: 'correctPassword' } })
    
    const unlockButton = screen.getByRole('button', { name: /unlock/i })
    fireEvent.click(unlockButton)
    
    await waitFor(() => {
      expect(memoryStore.set).toHaveBeenCalledWith('decryptedKey')
      expect(screen.getByText('Noted unlocked successfully')).toBeDefined()
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  test('shows error with incorrect password', async () => {
    // Create a new instance with secureCompare returning false
    const mockEncryptionService = new EncryptionService()
    mockEncryptionService.secureCompare.mockResolvedValueOnce(false)
    
    render(<UnlockModal {...defaultProps} />, { preloadedState })
    
    const passwordInput = screen.getByLabelText(/master password/i)
    fireEvent.change(passwordInput, { target: { value: 'wrongPassword' } })
    
    const unlockButton = screen.getByRole('button', { name: /unlock/i })
    fireEvent.click(unlockButton)
    
    await waitFor(() => {
      expect(screen.getByText('Incorrect master password')).toBeDefined()
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })
}) 