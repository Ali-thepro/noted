const mongoose = require('mongoose')
const assert = require('node:assert')
const { test, describe, beforeEach, after } = require('node:test')
const { api, clearDatabase, initialUsers, setupTestUser } = require('./test_helper')

describe('Encryption API', () => {
  beforeEach(async () => {
    await clearDatabase()
  })

  describe('Encryption Setup (POST /api/encryption/setup)', () => {
    let authCookie

    beforeEach(async () => {
      const signupResponse = await api
        .post('/api/auth/signup')
        .send(initialUsers[0])
      authCookie = signupResponse.headers['set-cookie']
    })

    test('succeeds with valid data', async () => {
      const encryptionData = {
        masterPasswordHash: 'hashedMasterPass123',
        protectedSymmetricKey: 'encryptedKey123',
        iv: 'iv123'
      }

      const response = await api
        .post('/api/encryption/setup')
        .set('Cookie', authCookie)
        .send(encryptionData)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.message, 'Encryption setup successful')

      const statusResponse = await api
        .get('/api/encryption/status')
        .set('Cookie', authCookie)
        .expect(200)

      assert.strictEqual(statusResponse.body, true)
    })

    test('fails if already set up', async () => {
      const encryptionData = {
        masterPasswordHash: 'hashedMasterPass123',
        protectedSymmetricKey: 'encryptedKey123',
        iv: 'iv123'
      }

      await api
        .post('/api/encryption/setup')
        .set('Cookie', authCookie)
        .send(encryptionData)

      const response = await api
        .post('/api/encryption/setup')
        .set('Cookie', authCookie)
        .send(encryptionData)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.error, 'Encryption is already set up')
    })
  })

  describe('Encryption Data Retrieval', () => {
    let authCookie

    beforeEach(async () => {
      authCookie = await setupTestUser()
    })

    test('gets master password hash', async () => {
      const response = await api
        .get('/api/encryption/password')
        .set('Cookie', authCookie)
        .expect(200)

      assert(response.body)
    })

    test('gets protected symmetric key', async () => {
      const response = await api
        .get('/api/encryption/symmetric-key')
        .set('Cookie', authCookie)
        .expect(200)

      assert(response.body)
    })

    test('gets initialization vector', async () => {
      const response = await api
        .get('/api/encryption/iv')
        .set('Cookie', authCookie)
        .expect(200)

      assert(response.body)
    })

    test('fails to get data when not set up', async () => {
      const signupResponse = await api
        .post('/api/auth/signup')
        .send(initialUsers[1])
      const newAuthCookie = signupResponse.headers['set-cookie']

      await api
        .get('/api/encryption/password')
        .set('Cookie', newAuthCookie)
        .expect(400)
        .expect('Content-Type', /application\/json/)
    })
  })

  describe('Encryption Data Access', () => {
    let authCookie

    beforeEach(async () => {
      const signupResponse = await api
        .post('/api/auth/signup')
        .send(initialUsers[0])
      authCookie = signupResponse.headers['set-cookie']
    })

    test('fails to get master password hash when not set up', async () => {
      const response = await api
        .get('/api/encryption/password')
        .set('Cookie', authCookie)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.error, 'Please create a master password')
    })
    test('fails to get protected symmetric key when not set up', async () => {
      const response = await api
        .get('/api/encryption/symmetric-key')
        .set('Cookie', authCookie)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.error, 'Please create a master password')
    })

    test('fails to get iv when not set up', async () => {
      const response = await api
        .get('/api/encryption/iv')
        .set('Cookie', authCookie)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.error, 'Please create a master password')
    })
  })

  after(async () => {
    await mongoose.connection.close()
  })
})
