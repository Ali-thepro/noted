import argon2 from 'argon2-browser/dist/argon2-bundled.min.js'

const ARGON2_MEMORY_COST = 65536
const ARGON2_TIME_COST = 4
const ARGON2_PARALLELISM = 3

export class EncryptionService {
  utf8ToArray(str) {
    return new TextEncoder().encode(str)
  }

  arrayToBase64(bytes) {
    // let binary = ''
    // for (let i = 0; i < bytes.length; i++) {
    //   binary += String.fromCharCode(bytes[i])
    // }
    return btoa(String.fromCharCode(...bytes))
  }

  base64ToArray(str) {
    // const binary = atob(str)
    // const bytes = new Uint8Array(binary.length)
    // for (let i = 0; i < binary.length; i++) {
    //   bytes[i] = binary.charCodeAt(i)
    // }
    // return bytes
    return new Uint8Array([...atob(str)].map(c => c.charCodeAt(0)))
  }

  async hash(value) {
    const salt = this.utf8ToArray(value.toLowerCase())
    const buffer = await crypto.subtle.digest('SHA-256', salt)
    return new Uint8Array(buffer)
  }

  async generateMasterKey(masterPassword, emailHash) {
    const result = await argon2.hash({
      pass: masterPassword,
      salt: emailHash,
      type: argon2.ArgonType.Argon2id,
      mem: ARGON2_MEMORY_COST,
      time: ARGON2_TIME_COST,
      parallelism: ARGON2_PARALLELISM,
      hashLen: 32
    })
    return result.hash
  }

  async generateMasterPasswordHash(masterKey, masterPassword) {
    const result = await argon2.hash({
      pass: masterKey,
      salt: masterPassword,
      type: argon2.ArgonType.Argon2id,
      mem: ARGON2_MEMORY_COST,
      time: ARGON2_TIME_COST,
      parallelism: ARGON2_PARALLELISM,
      hashLen: 32
    })
    return { hash: result.hash, encoded: result.encoded }
  }

  async secureCompare(a, b) {
    const arrayA = this.utf8ToArray(a)
    const arrayB = this.utf8ToArray(b)

    const mac = new Uint8Array(32)
    crypto.getRandomValues(mac)

    const key = await crypto.subtle.importKey(
      'raw',
      mac,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const mac1 = new Uint8Array(await crypto.subtle.sign('HMAC', key, arrayA))
    const mac2 = new Uint8Array(await crypto.subtle.sign('HMAC', key, arrayB))

    if (mac1.length !== mac2.length) {
      return false
    }
    let result = 0
    for (let i = 0; i < mac1.length; i++) {
      result |= mac1[i] ^ mac2[i]
    }

    return result === 0

  }

  async hkdf(masterKey, emailHash, length = 32) {
    const info = this.utf8ToArray('encryption')
    const key = await crypto.subtle.importKey(
      'raw',
      masterKey,
      { name: 'HKDF' },
      false,
      ['deriveBits']
    )

    const derivedKey = await crypto.subtle.deriveBits(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: emailHash,
        info: info
      },
      key,
      length * 8
    )

    return new Uint8Array(derivedKey)
  }

  async generateKey(size = 32) {
    const key = new Uint8Array(size)
    crypto.getRandomValues(key)
    return key
  }

  async encryptSymmetricKey(symmetricKey, stretchedKey) {
    const iv = new Uint8Array(12)
    crypto.getRandomValues(iv)
    const key = await crypto.subtle.importKey(
      'raw',
      stretchedKey,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    )
    const encryptedKey = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      symmetricKey
    )
    return {
      encryptedKey: this.arrayToBase64(new Uint8Array(encryptedKey)),
      iv: this.arrayToBase64(iv)
    }
  }

  async decryptSymmetricKey(encryptedKeyBase64, ivBase64, stretchedKey) {
    const iv = this.base64ToArray(ivBase64)
    const encryptedKey = this.base64ToArray(encryptedKeyBase64)
    const key = await crypto.subtle.importKey(
      'raw',
      stretchedKey,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    )
    const decryptedKey = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedKey
    )
    return new Uint8Array(decryptedKey)
  }

  async encryptNoteContent(content, noteCipherKey) {
    const iv = new Uint8Array(12)
    crypto.getRandomValues(iv)
    const key = await crypto.subtle.importKey(
      'raw',
      noteCipherKey,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    )
    const data = new TextEncoder().encode(content)
    const enc = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    )

    return {
      encryptedContent: this.arrayToBase64(new Uint8Array(enc)),
      iv: this.arrayToBase64(iv),
    }
  }

  async decryptNoteContent(encryptedContentBase64, ivBase64, noteCipherKey) {
    const iv = this.base64ToArray(ivBase64)
    const encryptedContent = this.base64ToArray(encryptedContentBase64)
    const key = await crypto.subtle.importKey(
      'raw',
      noteCipherKey,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    )
    const dec = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedContent
    )
    return new TextDecoder().decode(dec)
  }

  async wrapNoteCipherKey(noteCipherKey, symmetricKey) {
    const iv = new Uint8Array(12)
    crypto.getRandomValues(iv)
    const key = await crypto.subtle.importKey(
      'raw',
      symmetricKey,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    )
    const enc = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      noteCipherKey
    )

    return {
      protectedKey: this.arrayToBase64(new Uint8Array(enc)),
      iv: this.arrayToBase64(iv),
    }
  }

  async unwrapNoteCipherKey(protectedKeyBase64, ivBase64, symmetricKey) {
    const iv = this.base64ToArray(ivBase64)
    const protectedKey = this.base64ToArray(protectedKeyBase64)
    const key = await crypto.subtle.importKey(
      'raw',
      symmetricKey,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    )
    const dec = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      protectedKey
    )
    return new Uint8Array(dec)
  }
}
