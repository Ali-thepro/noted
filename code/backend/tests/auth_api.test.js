const mongoose = require('mongoose')
const { test, describe, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const { api, clearDatabase } = require('./test_helper')
const User = require('../models/user')

describe('Auth API', () => {
  beforeEach(async () => {
    await clearDatabase()
  })

  describe('POST /api/auth/signup', () => {
    test('creates a new user with valid data', async () => {
      const newUser = {
        username: 'testuser',
        email: 'test@test.com',
        password: 'Password123',
        confirmPassword: 'Password123'
      }

      const response = await api
        .post('/api/auth/signup')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      // Check response data
      assert.strictEqual(response.body.username, newUser.username)
      assert.strictEqual(response.body.email, newUser.email)
      assert.strictEqual(response.body.provider, 'local')
      assert.strictEqual(response.body.oauth, false)

      // Password should not be returned
      assert.strictEqual(response.body.passwordHash, undefined)

      // Verify user was saved to database
      const savedUser = await User.findOne({ email: newUser.email })
      assert.strictEqual(savedUser.username, newUser.username)
    })

    test('fails with proper error if username is missing', async () => {
      const newUser = {
        email: 'test@test.com',
        password: 'Password123',
        confirmPassword: 'Password123'
      }

      const response = await api
        .post('/api/auth/signup')
        .send(newUser)
        .expect(400)

      assert.strictEqual(response.body.error, 'All fields are required')
    })

    test('fails if passwords do not match', async () => {
      const newUser = {
        username: 'testuser',
        email: 'test@test.com',
        password: 'Password123',
        confirmPassword: 'Password124'
      }

      const response = await api
        .post('/api/auth/signup')
        .send(newUser)
        .expect(400)

      assert.strictEqual(response.body.error, 'Passwords do not match')
    })

    test('fails if password is too weak', async () => {
      const newUser = {
        username: 'testuser',
        email: 'test@test.com',
        password: 'weak',
        confirmPassword: 'weak'
      }

      const response = await api
        .post('/api/auth/signup')
        .send(newUser)
        .expect(400)

      assert.strictEqual(
        response.body.error,
        'Password must be at least 8 characters long and must contain at least one number and one letter'
      )
    })
  })

  describe('POST /api/auth/signin', () => {
    beforeEach(async () => {
      // Create a test user before each signin test
      await api
        .post('/api/auth/signup')
        .send({
          username: 'testuser',
          email: 'test@test.com',
          password: 'Password123',
          confirmPassword: 'Password123'
        })
    })

    test('succeeds with correct credentials', async () => {
      const response = await api
        .post('/api/auth/signin')
        .send({
          email: 'test@test.com',
          password: 'Password123'
        })
        .expect(200)
        .expect('Content-Type', /application\/json/)

      // Check user data in response
      assert.strictEqual(response.body.email, 'test@test.com')
      assert.strictEqual(response.body.username, 'testuser')

      // Check that cookies are set
      const cookies = response.headers['set-cookie']
      assert(cookies.some(cookie => cookie.includes('accessToken')))
      assert(cookies.some(cookie => cookie.includes('refreshToken')))
    })

    test('fails with incorrect password', async () => {
      const response = await api
        .post('/api/auth/signin')
        .send({
          email: 'test@test.com',
          password: 'WrongPassword123'
        })
        .expect(401)

      assert.strictEqual(response.body.error, 'Invalid email or password')
    })

    test('handles CLI mode signin correctly', async () => {
      const response = await api
        .post('/api/auth/signin?mode=cli&redirect=http://localhost:3000/callback')
        .send({
          email: 'test@test.com',
          password: 'Password123'
        })
        .expect(200)

      // Should return redirect URL with token
      assert(response.body.redirectUrl.startsWith('http://localhost:3000/callback?token='))
    })
  })

  after(async () => {
    await mongoose.connection.close()
  })
})
