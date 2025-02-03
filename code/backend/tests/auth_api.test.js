const mongoose = require('mongoose')
const assert = require('node:assert')
const { test, describe, beforeEach, after } = require('node:test')
const { api, clearDatabase, getUsersInDb, initialUsers } = require('./test_helper')
const User = require('../models/user')
const bcrypt = require('bcrypt')

describe('Auth API', () => {
  beforeEach(async () => {
    await clearDatabase()
  })

  describe('User Registration (POST /api/auth/signup)', () => {
    beforeEach(async () => {
      const passwordHash = await bcrypt.hash('Password123', 10)
      const user = new User({
        username: 'rootuser',
        email: 'root@test.com',
        passwordHash,
        provider: 'local',
        oauth: false
      })
      await user.save()
    })
    test('creates a new user with valid data and sets cookies', async () => {
      const usersAtStart = await getUsersInDb()
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

      assert.strictEqual(response.body.username, newUser.username)
      assert.strictEqual(response.body.email, newUser.email)
      assert.strictEqual(response.body.provider, 'local')
      assert.strictEqual(response.body.oauth, false)
      assert(!response.body.passwordHash)

      const savedUser = await User.findOne({ email: newUser.email })
      assert.strictEqual(savedUser.username, newUser.username)

      const cookies = response.headers['set-cookie']
      assert(cookies.some(cookie => cookie.includes('accessToken')))
      assert(cookies.some(cookie => cookie.includes('refreshToken')))


      const usersAtEnd = await getUsersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)
      const emails = usersAtEnd.map(user => user.email)
      assert(emails.includes(newUser.email))
    })

    test('handles CLI mode signup correctly', async () => {
      const newUser = {
        username: 'cliuser',
        email: 'cli@test.com',
        password: 'Password123',
        confirmPassword: 'Password123'
      }

      const response = await api
        .post('/api/auth/signup?mode=cli&redirect=http://localhost:3000/')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      assert(response.body.redirectUrl.startsWith('http://localhost:3000/?token='))
      assert(response.body.user.username === newUser.username)
      assert(response.body.user.email === newUser.email)

      const cookies = response.headers['set-cookie']
      assert(!cookies)
    })

    describe('fails with proper error message when', () => {
      test('required fields are missing', async () => {
        const usersAtStart = await getUsersInDb()
        const invalidUsers = [
          { email: 'test@test.com', password: 'Password123', confirmPassword: 'Password123' },
          { username: 'test', password: 'Password123', confirmPassword: 'Password123' },
          { username: 'test', email: 'test@test.com', confirmPassword: 'Password123' },
          { username: 'test', email: 'test@test.com', password: 'Password123' }
        ]

        for (const invalidUser of invalidUsers) {
          const response = await api
            .post('/api/auth/signup')
            .send(invalidUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

          const usersAtEnd = await getUsersInDb()
          assert.strictEqual(usersAtEnd.length, usersAtStart.length)

          assert.strictEqual(response.body.error, 'All fields are required')
        }
      })

      test('passwords do not match', async () => {
        const usersAtStart = await getUsersInDb()
        const response = await api
          .post('/api/auth/signup')
          .send({
            username: 'testuser',
            email: 'test@test.com',
            password: 'Password123',
            confirmPassword: 'DifferentPassword123'
          })
          .expect(400)
          .expect('Content-Type', /application\/json/)

        const usersAtEnd = await getUsersInDb()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)

        assert.strictEqual(response.body.error, 'Passwords do not match')
      })

      test('password is too weak', async () => {
        const usersAtStart = await getUsersInDb()
        const weakPasswords = [
          'short',
          '12345678',
          'abcdefgh',
          'ab12',
        ]

        for (const password of weakPasswords) {
          const response = await api
            .post('/api/auth/signup')
            .send({
              username: 'testuser',
              email: 'test@test.com',
              password,
              confirmPassword: password
            })
            .expect(400)
            .expect('Content-Type', /application\/json/)

          const usersAtEnd = await getUsersInDb()
          assert.strictEqual(usersAtEnd.length, usersAtStart.length)

          assert.strictEqual(response.body.error, 'Password must be at least 8 characters long and must contain at least one number and one letter')
        }
      })

      test('email is already registered', async () => {
        await api
          .post('/api/auth/signup')
          .send(initialUsers[0])

        const usersAtStart = await getUsersInDb()

        const response = await api
          .post('/api/auth/signup')
          .send({
            ...initialUsers[0],
            username: 'different'
          })
          .expect(400)
          .expect('Content-Type', /application\/json/)
        const usersAtEnd = await getUsersInDb()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)

        assert.strictEqual(response.body.error, 'An account with this email already exists')
      })

      test('username is too short', async () => {
        const usersAtStart = await getUsersInDb()
        const response = await api
          .post('/api/auth/signup')
          .send({
            ...initialUsers[0],
            username: 'a'
          })
          .expect(400)
          .expect('Content-Type', /application\/json/)

        const usersAtEnd = await getUsersInDb()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)

        assert.strictEqual(response.body.error, 'User validation failed: username: username must be at least 5 characters long')
      })

      test('username is too long', async () => {
        const usersAtStart = await getUsersInDb()
        const response = await api
          .post('/api/auth/signup')
          .send({
            ...initialUsers[0],
            username: 'a'.repeat(21)
          })
          .expect(400)
          .expect('Content-Type', /application\/json/)

        const usersAtEnd = await getUsersInDb()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)

        assert.strictEqual(response.body.error, 'User validation failed: username: username must not be more than 20 characters')
      })

      test('username is already taken', async () => {
        await api
          .post('/api/auth/signup')
          .send(initialUsers[0])

        const usersAtStart = await getUsersInDb()

        const response = await api
          .post('/api/auth/signup')
          .send({
            ...initialUsers[0],
            email: 'different@test.com'
          })
          .expect(400)
          .expect('Content-Type', /application\/json/)

        const usersAtEnd = await getUsersInDb()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)

        assert.strictEqual(response.body.error, 'expected username to be unique')
      })
    })
  })

  describe('User Authentication (POST /api/auth/signin)', () => {
    beforeEach(async () => {
      await api
        .post('/api/auth/signup')
        .send(initialUsers[0])
    })

    test('succeeds with correct credentials', async () => {
      const response = await api
        .post('/api/auth/signin')
        .send({
          email: initialUsers[0].email,
          password: initialUsers[0].password
        })
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.email, initialUsers[0].email)
      assert.strictEqual(response.body.username, initialUsers[0].username)

      const cookies = response.headers['set-cookie']
      assert(cookies.some(cookie => cookie.includes('accessToken')))
      assert(cookies.some(cookie => cookie.includes('refreshToken')))
    })

    test('handles CLI mode signin correctly', async () => {
      const response = await api
        .post('/api/auth/signin?mode=cli&redirect=http://localhost:3000/')
        .send({
          email: 'test@test.com',
          password: 'Password123'
        })
        .expect(200)
        .expect('Content-Type', /application\/json/)
      assert(response.body.redirectUrl.startsWith('http://localhost:3000/?token='))

      const cookies = response.headers['set-cookie']
      assert(!cookies)
    })

    describe('fails with proper error message when', () => {
      test('required fields are missing', async () => {
        const response = await api
          .post('/api/auth/signin')
          .send({
            email: initialUsers[0].email
          })
          .expect(400)
          .expect('Content-Type', /application\/json/)

        assert.strictEqual(response.body.error, 'Email and password are required')
      })

      test('password is incorrect', async () => {
        const response = await api
          .post('/api/auth/signin')
          .send({
            email: initialUsers[0].email,
            password: 'WrongPassword123'
          })
          .expect(401)
          .expect('Content-Type', /application\/json/)

        assert.strictEqual(response.body.error, 'Invalid email or password')
      })

      test('email is incorrect', async () => {
        const response = await api
          .post('/api/auth/signin')
          .send({
            email: 'wrong@test.com',
            password: initialUsers[0].password
          })
          .expect(401)
          .expect('Content-Type', /application\/json/)

        assert.strictEqual(response.body.error, 'Invalid email or password')
      })
    })

  })

  after(async () => {
    await mongoose.connection.close()
  })
})
