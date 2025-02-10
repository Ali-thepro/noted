import argon2 from 'argon2-browser'

const ARGON2_MEMORY_COST = 65536
const ARGON2_TIME_COST = 4
const ARGON2_PARALLELISM = 3
const KEY_LENGTH = 32

export class EncryptionService {
  utf8ToArray(str) {
    return new TextEncoder().encode(str)
  }

  arrayToBase64(bytes) {
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  base64ToArray(str) {
    const binary = atob(str)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes
  }

  async hash(email) {
    const salt = this.utf8ToArray(email.toLowerCase())
    const buffer = await crypto.subtle.digest('SHA-256', salt)
    return new Uint8Array(buffer)
  }

  static async generateMasterKey(masterPassword, emailHash) {

    try {
      const result = await argon2.hash({
        pass: masterPassword,
        salt: emailHash,
        type: argon2.ArgonType.Argon2id,
        mem: ARGON2_MEMORY_COST,
        time: ARGON2_TIME_COST,
        parallelism: ARGON2_PARALLELISM,
        hashLen: KEY_LENGTH
      })

      return {
        hash: result.hash,
        encoded: result.encoded
      }
    } catch (error) {
      throw new Error(`Failed to generate master key ${error}`)
    }
  }

  async hkdf(masterKey, emailHash, length = 64) {
    const info = this.utf8ToArray('encryption')
    const key = await crypto.subtle.importKey(
      'raw',
      masterKey,
      { name: 'HKDF' },
      false,
      ['deriveBits']
    )

    const derivedKey = await crypto.subtle.deriveBits(
      { name: 'HKDF', salt: emailHash, info },
      key,
      length * 8
    )

    return new Uint8Array(derivedKey)
  }
}
