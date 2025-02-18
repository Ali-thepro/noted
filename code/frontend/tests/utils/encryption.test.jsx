import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import axios from 'axios'
import { setup, getMasterPasswordHash, getProtectedSymmetricKey, getIv, encryptionStatus } from '../../src/services/encryption'

// Mock axios
vi.mock('axios')

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
