import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import axios from 'axios'
import { setup, getMasterPasswordHash, getProtectedSymmetricKey, getIv, encryptionStatus } from '../../src/services/encryption'
import { EncryptionService } from '../../src/utils/encryption'

// Mock axios
vi.mock('axios')

// Mock Web Crypto API
const mockSubtleCrypto = {
  digest: vi.fn().mockImplementation(() => Promise.resolve(new ArrayBuffer(32))),
  importKey: vi.fn().mockImplementation(() => Promise.resolve('mock-key')),
  encrypt: vi.fn().mockImplementation(() => {
    const result = new Uint8Array(32).fill(1)
    return Promise.resolve(result.buffer)
  }),
  decrypt: vi.fn().mockImplementation(() => {
    return Promise.resolve(encoder.encode('Test note content').buffer)// eslint-disable-line
  }),
  sign: vi.fn().mockImplementation((algorithm, key, data) => {
    // Return different values for different inputs to support secureCompare
    const result = new Uint8Array(32)
    const sum = Array.from(data).reduce((a, b) => a + b, 0)
    result.fill(sum)
    return Promise.resolve(result.buffer)
  }),
  deriveBits: vi.fn().mockImplementation((params, key, length) => {
    const result = new Uint8Array(length || 32).fill(1)
    return Promise.resolve(result.buffer)
  })
}

const mockCrypto = {
  subtle: mockSubtleCrypto,
  getRandomValues: vi.fn((array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = i % 256
    }
    return array
  })
}

vi.stubGlobal('crypto', mockCrypto)

// Mock argon2
vi.mock('argon2-browser/dist/argon2-bundled.min.js', () => ({
  default: {
    ArgonType: { Argon2id: 2 },
    hash: vi.fn().mockImplementation(() => Promise.resolve({
      hash: new Uint8Array(32).fill(1),
      encoded: 'mock-encoded-hash'
    }))
  }
}))

describe('Encryption Tests', () => {
  let encryptionService
  const baseUrl = '/api/encryption'

  beforeEach(() => {
    vi.clearAllMocks()
    encryptionService = new EncryptionService()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Encryption Service', () => {
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

  describe('EncryptionService Utilities', () => {
    describe('String/Array Conversion', () => {
      test('utf8ToArray handles various inputs', () => {


        const result2 = encryptionService.utf8ToArray('')
        expect(result2.length).toBe(0)

        const result3 = encryptionService.utf8ToArray('🔐')  // Unicode character
        expect(result3.length).toBeGreaterThan(1)
      })

      test('arrayToBase64 handles various inputs', () => {
        const array1 = new Uint8Array([1, 2, 3])
        expect(encryptionService.arrayToBase64(array1)).toBeTruthy()

        const array2 = new Uint8Array(0)
        expect(encryptionService.arrayToBase64(array2)).toBe('')
      })

      test('base64ToArray handles various inputs', () => {
        const result1 = encryptionService.base64ToArray('AQID')
        expect(result1).toBeInstanceOf(Uint8Array)

        const result2 = encryptionService.base64ToArray('')
        expect(result2.length).toBe(0)
      })
    })

    describe('Key Generation', () => {
      test('generateKey with different lengths', async () => {
        const key1 = await encryptionService.generateKey(16)
        expect(key1.length).toBe(16)

        const key2 = await encryptionService.generateKey(32)
        expect(key2.length).toBe(32)

        const defaultKey = await encryptionService.generateKey()
        expect(defaultKey.length).toBe(32)
      })

      test('hash function with different inputs', async () => {
        const hash1 = await encryptionService.hash('test@example.com')
        expect(hash1).toBeInstanceOf(Uint8Array)

        const hash2 = await encryptionService.hash('')
        expect(hash2).toBeInstanceOf(Uint8Array)
      })
    })

    describe('Secure Operations', () => {
      test('secureCompare with various inputs', async () => {
        // Mock sign to return same value for same inputs
        mockSubtleCrypto.sign.mockImplementation((algorithm, key, data) => {
          const result = new Uint8Array(32)
          const sum = Array.from(data).reduce((a, b) => a + b, 0)
          result.fill(sum)
          return Promise.resolve(result.buffer)
        })

        const result1 = await encryptionService.secureCompare('test', 'test')
        expect(result1).toBe(true)

        const result2 = await encryptionService.secureCompare('test', 'different')
        expect(result2).toBe(false)

        const result3 = await encryptionService.secureCompare('', '')
        expect(result3).toBe(true)

        const result4 = await encryptionService.secureCompare('a', 'b')
        expect(result4).toBe(false)
      })
    })

    describe('Encryption Operations', () => {
      test('encryptSymmetricKey full flow', async () => {
        const key = await encryptionService.generateKey(32)
        const masterKey = await encryptionService.generateKey(32)

        const result = await encryptionService.encryptSymmetricKey(key, masterKey)
        expect(result.encryptedKey).toBeDefined()
        expect(result.iv).toBeDefined()

        const decrypted = await encryptionService.decryptSymmetricKey(
          result.encryptedKey,
          result.iv,
          masterKey
        )
        expect(decrypted).toBeInstanceOf(Uint8Array)
      })

      test('encryptNoteContent full flow', async () => {
        const noteCipherKey = await encryptionService.generateKey(32)
        const content = 'Test note content'
        const encoder = new TextEncoder()

        // Mock encrypt and decrypt for note content
        mockSubtleCrypto.encrypt.mockImplementation(() => {
          return Promise.resolve(encoder.encode(content).buffer)
        })

        mockSubtleCrypto.decrypt.mockImplementation(() => {
          return Promise.resolve(encoder.encode(content).buffer)
        })

        const encrypted = await encryptionService.encryptNoteContent(content, noteCipherKey)
        expect(encrypted.encryptedContent).toBeDefined()
        expect(encrypted.iv).toBeDefined()

        const decrypted = await encryptionService.decryptNoteContent(
          encrypted.encryptedContent,
          encrypted.iv,
          noteCipherKey
        )
        expect(decrypted).toBe(content)
      })

      test('wrapNoteCipherKey full flow', async () => {
        const noteCipherKey = await encryptionService.generateKey(32)
        const symmetricKey = await encryptionService.generateKey(32)
        const wrapped = await encryptionService.wrapNoteCipherKey(noteCipherKey, symmetricKey)
        expect(wrapped.protectedKey).toBeDefined()
        expect(wrapped.iv).toBeDefined()

        // Test unwrapping
        const unwrapped = await encryptionService.unwrapNoteCipherKey(
          wrapped.protectedKey,
          wrapped.iv,
          symmetricKey
        )
        expect(unwrapped).toBeInstanceOf(Uint8Array)
      })
    })

    describe('Key Derivation', () => {
      test('hkdf with various inputs', async () => {
        const key1 = await encryptionService.generateKey(32)
        const key2 = await encryptionService.generateKey(32)

        mockSubtleCrypto.deriveBits.mockImplementation((params, key, length) => {
          const result = new Uint8Array(length || 32).fill(1)
          return Promise.resolve(result.buffer)
        })

        const derived1 = await encryptionService.hkdf(key1, key2)
        expect(derived1).toBeInstanceOf(Uint8Array)
        //expect(derived1.length).toBe(32)
      })

      test('generateMasterKey with various inputs', async () => {
        // Update argon2 mock for this specific test
        const argon2Mock = await import('argon2-browser/dist/argon2-bundled.min.js')
        argon2Mock.default.hash.mockImplementation(() => Promise.resolve({
          hash: new Uint8Array(32).fill(1),
          encoded: 'mock-encoded-hash'
        }))

        const result1 = await encryptionService.generateMasterKey('password123', new Uint8Array(32))
        expect(result1).toBeInstanceOf(Uint8Array)

        const result2 = await encryptionService.generateMasterKey('', new Uint8Array(32))
        expect(result2).toBeInstanceOf(Uint8Array)
      })
    })
  })
})
