import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import axios from 'axios'
import { setup, getMasterPasswordHash, getProtectedSymmetricKey, getIv, encryptionStatus } from '../../src/services/encryption'

// Mock axios
vi.mock('axios')
const mockSubtleCrypto = {
  digest: vi.fn().mockImplementation(() => Promise.resolve(new ArrayBuffer(32))),
  importKey: vi.fn().mockImplementation(() => Promise.resolve('mock-key')),
  encrypt: vi.fn().mockImplementation(() => Promise.resolve(new ArrayBuffer(32))),
  decrypt: vi.fn().mockImplementation(() => Promise.resolve(new ArrayBuffer(32))),
  sign: vi.fn().mockImplementation(() => Promise.resolve(new ArrayBuffer(32)))
}

const mockCrypto = {
  subtle: mockSubtleCrypto,
  getRandomValues: vi.fn((array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
    return array
  })
}

vi.stubGlobal('crypto', mockCrypto)

describe('Encryption Service Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('API Endpoints', () => {
    test('setup successfully sends encryption data', async () => {
      const mockResponse = { data: { message: 'Encryption setup successful' } }
      axios.post.mockResolvedValueOnce(mockResponse)

      const setupData = {
        masterPasswordHash: 'hashedPassword123',
        protectedSymmetricKey: 'encryptedKey456',
        iv: 'initVector789'
      }

      const result = await setup(setupData)
      expect(result).toEqual(mockResponse.data)
      expect(axios.post).toHaveBeenCalledWith('/api/encryption/setup', setupData)
    })

    test('getMasterPasswordHash retrieves hash', async () => {
      const mockResponse = { data: 'hashedPassword123' }
      axios.get.mockResolvedValueOnce(mockResponse)

      const result = await getMasterPasswordHash()
      expect(result).toBe(mockResponse.data)
      expect(axios.get).toHaveBeenCalledWith('/api/encryption/password')
    })

    test('getProtectedSymmetricKey retrieves key', async () => {
      const mockResponse = { data: 'encryptedKey456' }
      axios.get.mockResolvedValueOnce(mockResponse)

      const result = await getProtectedSymmetricKey()
      expect(result).toBe(mockResponse.data)
      expect(axios.get).toHaveBeenCalledWith('/api/encryption/symmetric-key')
    })

    test('getIv retrieves initialization vector', async () => {
      const mockResponse = { data: 'initVector789' }
      axios.get.mockResolvedValueOnce(mockResponse)

      const result = await getIv()
      expect(result).toBe(mockResponse.data)
      expect(axios.get).toHaveBeenCalledWith('/api/encryption/iv')
    })

    test('encryptionStatus retrieves status', async () => {
      const mockResponse = { data: true }
      axios.get.mockResolvedValueOnce(mockResponse)

      const result = await encryptionStatus()
      expect(result).toBe(mockResponse.data)
      expect(axios.get).toHaveBeenCalledWith('/api/encryption/status')
    })
  })

  describe('Error Handling', () => {
    test('setup handles error', async () => {
      const mockError = new Error('Setup failed')
      axios.post.mockRejectedValueOnce(mockError)

      await expect(setup({})).rejects.toThrow('Setup failed')
    })

    test('getMasterPasswordHash handles error', async () => {
      const mockError = new Error('Failed to get hash')
      axios.get.mockRejectedValueOnce(mockError)

      await expect(getMasterPasswordHash()).rejects.toThrow('Failed to get hash')
    })

    test('getProtectedSymmetricKey handles error', async () => {
      const mockError = new Error('Failed to get key')
      axios.get.mockRejectedValueOnce(mockError)

      await expect(getProtectedSymmetricKey()).rejects.toThrow('Failed to get key')
    })
  })
})

vi.mock('argon2-browser/dist/argon2-bundled.min.js', () => ({
  default: {
    ArgonType: { Argon2id: 2 },
    hash: vi.fn().mockImplementation(() => Promise.resolve({
      hash: new Uint8Array(32).fill(1),
      encoded: 'mock-encoded-hash'
    }))
  }
}))

describe('Encryption Service', () => {
  const baseUrl = '/api/encryption'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('setup', () => {
    test('successfully sets up encryption', async () => {
      const mockData = {
        masterPasswordHash: 'hashedPassword123',
        protectedSymmetricKey: 'encryptedKey456',
        iv: 'initVector789'
      }
      const mockResponse = { data: { message: 'Encryption setup successful' } }

      axios.post.mockResolvedValueOnce(mockResponse)

      const result = await setup(mockData)

      expect(axios.post).toHaveBeenCalledWith(`${baseUrl}/setup`, mockData)
      expect(result).toEqual(mockResponse.data)
    })

    test('handles setup error', async () => {
      const mockError = new Error('Setup failed')
      axios.post.mockRejectedValueOnce(mockError)

      await expect(setup({})).rejects.toThrow('Setup failed')
      expect(axios.post).toHaveBeenCalledWith(`${baseUrl}/setup`, {})
    })
  })

  describe('getMasterPasswordHash', () => {
    test('successfully gets master password hash', async () => {
      const mockResponse = { data: 'hashedPassword123' }
      axios.get.mockResolvedValueOnce(mockResponse)

      const result = await getMasterPasswordHash()

      expect(axios.get).toHaveBeenCalledWith(`${baseUrl}/password`)
      expect(result).toEqual(mockResponse.data)
    })

    test('handles getMasterPasswordHash error', async () => {
      const mockError = new Error('Failed to get master password hash')
      axios.get.mockRejectedValueOnce(mockError)

      await expect(getMasterPasswordHash()).rejects.toThrow('Failed to get master password hash')
      expect(axios.get).toHaveBeenCalledWith(`${baseUrl}/password`)
    })
  })

  describe('getProtectedSymmetricKey', () => {
    test('successfully gets protected symmetric key', async () => {
      const mockResponse = { data: 'encryptedKey456' }
      axios.get.mockResolvedValueOnce(mockResponse)

      const result = await getProtectedSymmetricKey()

      expect(axios.get).toHaveBeenCalledWith(`${baseUrl}/symmetric-key`)
      expect(result).toEqual(mockResponse.data)
    })

    test('handles getProtectedSymmetricKey error', async () => {
      const mockError = new Error('Failed to get protected symmetric key')
      axios.get.mockRejectedValueOnce(mockError)

      await expect(getProtectedSymmetricKey()).rejects.toThrow('Failed to get protected symmetric key')
      expect(axios.get).toHaveBeenCalledWith(`${baseUrl}/symmetric-key`)
    })
  })

  describe('getIv', () => {
    test('successfully gets initialization vector', async () => {
      const mockResponse = { data: 'initVector789' }
      axios.get.mockResolvedValueOnce(mockResponse)

      const result = await getIv()

      expect(axios.get).toHaveBeenCalledWith(`${baseUrl}/iv`)
      expect(result).toEqual(mockResponse.data)
    })

    test('handles getIv error', async () => {
      const mockError = new Error('Failed to get IV')
      axios.get.mockRejectedValueOnce(mockError)

      await expect(getIv()).rejects.toThrow('Failed to get IV')
      expect(axios.get).toHaveBeenCalledWith(`${baseUrl}/iv`)
    })
  })

  describe('encryptionStatus', () => {
    test('successfully gets encryption status', async () => {
      const mockResponse = { data: true }
      axios.get.mockResolvedValueOnce(mockResponse)

      const result = await encryptionStatus()

      expect(axios.get).toHaveBeenCalledWith(`${baseUrl}/status`)
      expect(result).toEqual(mockResponse.data)
    })

    test('handles encryptionStatus error', async () => {
      const mockError = new Error('Failed to get encryption status')
      axios.get.mockRejectedValueOnce(mockError)

      await expect(encryptionStatus()).rejects.toThrow('Failed to get encryption status')
      expect(axios.get).toHaveBeenCalledWith(`${baseUrl}/status`)
    })
  })
})
