const mongoose = require('mongoose')
const assert = require('node:assert')
const { test, describe, beforeEach, after } = require('node:test')
const { api, clearDatabase, getUsersInDb, initialUsers } = require('./test_helper')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const config = require('../utils/config')
const nock = require('nock')

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

      test('username contains invalid characters', async () => {
        const usersAtStart = await getUsersInDb()
        const response = await api
          .post('/api/auth/signup')
          .send({
            ...initialUsers[0],
            username: '!!"!fefef23'
          })
          .expect(400)
          .expect('Content-Type', /application\/json/)

        const usersAtEnd = await getUsersInDb()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)

        assert.strictEqual(response.body.error, 'User validation failed: username: username can only contain letters and numbers')
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

  describe('Refresh Token (POST /api/auth/refresh-token)', () => {
    test('succeeds with valid refresh token', async () => {
      await api.post('/api/auth/signup').send(initialUsers[0])
      const signInResponse = await api
        .post('/api/auth/signin')
        .send({
          email: initialUsers[0].email,
          password: initialUsers[0].password,
        })
        .expect(200)

      const cookies = signInResponse.headers['set-cookie']

      const response = await api
        .post('/api/auth/refresh-token')
        .set('Cookie', cookies.join('; '))
        .expect(200)

      const newCookies = response.headers['set-cookie']
      assert(newCookies.some((cookie) => cookie.includes('accessToken')))
      assert.strictEqual(response.body.email, initialUsers[0].email)
    })

    test('fails when no refresh token provided', async () => {
      const response = await api.post('/api/auth/refresh-token').expect(401)
      assert.strictEqual(response.body.error, 'Refresh token not provided')
    })

    test('fails with an invalid refresh token', async () => {
      const invalidCookie = 'refreshToken=invalidtoken'
      const response = await api
        .post('/api/auth/refresh-token')
        .set('Cookie', invalidCookie)
        .expect(403)
      assert.strictEqual(response.body.error, 'Invalid refresh token')
    })

    test('fails when user not found for a valid refresh token', async () => {
      await api.post('/api/auth/signup').send(initialUsers[0])
      const signInResponse = await api
        .post('/api/auth/signin')
        .send({
          email: initialUsers[0].email,
          password: initialUsers[0].password,
        })
        .expect(200)
      const cookies = signInResponse.headers['set-cookie']

      await User.deleteMany({})

      const response = await api
        .post('/api/auth/refresh-token')
        .set('Cookie', cookies.join('; '))
        .expect(404)
      assert.strictEqual(response.body.error, 'User not found')
    })
  })

  describe('Sign Out (POST /api/auth/signout)', () => {
    test('signs out user by clearing cookies', async () => {
      await api.post('/api/auth/signup').send(initialUsers[0])
      const signInResponse = await api
        .post('/api/auth/signin')
        .send({
          email: initialUsers[0].email,
          password: initialUsers[0].password,
        })
        .expect(200)
      const cookies = signInResponse.headers['set-cookie']

      const response = await api
        .post('/api/auth/signout')
        .set('Cookie', cookies.join('; '))
        .expect(200)
      assert.strictEqual(response.text, 'User signed out successfully')

      const clearCookies = response.headers['set-cookie'] || []
      assert(clearCookies.some((cookie) => cookie.includes('accessToken=;')))
      assert(clearCookies.some((cookie) => cookie.includes('refreshToken=;')))
    })
  })

  describe('Get Current User (GET /api/auth/me)', () => {
    test('returns user info when authenticated', async () => {
      await api.post('/api/auth/signup').send(initialUsers[0])
      const signInResponse = await api
        .post('/api/auth/signin')
        .send({
          email: initialUsers[0].email,
          password: initialUsers[0].password,
        })
        .expect(200)
      const cookies = signInResponse.headers['set-cookie']

      const response = await api
        .get('/api/auth/me')
        .set('Cookie', cookies.join('; '))
        .expect(200)
      assert.strictEqual(response.body.email, initialUsers[0].email)
      assert.strictEqual(response.body.username, initialUsers[0].username)
    })

    test('fails when not authenticated', async () => {
      const response = await api.get('/api/auth/me').expect(401)
      assert.strictEqual(response.body.error, 'Unauthorised - No token, please re-authenticate')
    })
  })

  describe('OAuth Authentication', () => {
    beforeEach(async () => {
      nock.cleanAll()
    })

    describe('Google OAuth Flow', () => {
      test('redirects to Google OAuth URL with correct parameters', async () => {
        const response = await api
          .get('/api/auth/google')
          .expect(302)

        const location = response.headers.location
        assert(location.startsWith('https://accounts.google.com/o/oauth2/v2/auth'))
        assert(location.includes('redirect_uri='))
        const url = new URL(location)
        assert.deepStrictEqual(JSON.parse(url.searchParams.get('state')), {})
      })

      test('handles CLI mode signin correctly', async () => {
        const response = await api
          .get('/api/auth/google?mode=cli&redirect=http://localhost:3000/')
          .expect(302)

        const location = response.headers.location
        assert(location.startsWith('https://accounts.google.com/o/oauth2/v2/auth'))
        assert(location.includes('redirect_uri='))
        const url = new URL(location)
        const state = JSON.parse(url.searchParams.get('state'))
        assert.deepStrictEqual(state, { mode: 'cli', redirect: 'http://localhost:3000/' })
      })

      test('creates new user on first Google login', async () => {
        const mockCode = 'valid_mock_auth_code'

        nock('https://oauth2.googleapis.com')
          .post('/token')
          .reply(200, {
            id_token: 'mock_id_token',
            access_token: 'mock_access_token'
          })

        nock('https://www.googleapis.com')
          .get('/oauth2/v1/userinfo')
          .query({ alt: 'json', access_token: 'mock_access_token' })
          .reply(200, {
            email: 'google@test.com',
            name: 'Google User',
            verified_email: true
          })

        const response = await api
          .get(`/api/auth/google/callback?code=${mockCode}`)
          .expect(302)

        assert(response.headers.location.startsWith(config.UI_URI + '/oauth/callback'))

        const cookies = response.headers['set-cookie']
        assert(cookies.some(cookie => cookie.includes('accessToken')))
        assert(cookies.some(cookie => cookie.includes('refreshToken')))

        const user = await User.findOne({ email: 'google@test.com' })
        assert(user)
        assert.strictEqual(user.provider, 'google')
        assert(user.oauth)
      })

      test('handles CLI mode in Google callback', async () => {
        const mockCode = 'valid_mock_auth_code'
        const mockState = JSON.stringify({
          mode: 'cli',
          redirect: 'http://localhost:3000/callback'
        })

        nock('https://oauth2.googleapis.com')
          .post('/token')
          .reply(200, {
            id_token: 'mock_id_token',
            access_token: 'mock_access_token'
          })

        nock('https://www.googleapis.com')
          .get('/oauth2/v1/userinfo')
          .query({ alt: 'json', access_token: 'mock_access_token' })
          .reply(200, {
            email: 'google@test.com',
            name: 'Google User',
            verified_email: true
          })

        const response = await api
          .get(`/api/auth/google/callback?code=${mockCode}&state=${mockState}`)
          .expect(302)

        assert(response.headers.location.startsWith('http://localhost:3000/callback?token='))
        const cookies = response.headers['set-cookie']
        assert(!cookies)
      })

      test('handles errors in Google OAuth flow', async () => {
        const mockCode = 'invalid_code'

        nock('https://oauth2.googleapis.com')
          .post('/token')
          .replyWithError('Invalid authorization code')

        const response = await api
          .get(`/api/auth/google/callback?code=${mockCode}`)
          .expect(500)

        assert(response.body.error.includes('Error during Google OAuth callback'))
      })

      test('reuses existing Google user on subsequent logins', async () => {
        await User.create({
          email: 'google@test.com',
          username: 'existing-google-user',
          provider: 'google',
          passwordHash: 'dummy',
          oauth: true
        })

        const usersAtStart = await getUsersInDb()

        const mockCode = 'valid_mock_auth_code'

        nock('https://oauth2.googleapis.com')
          .post('/token')
          .reply(200, {
            id_token: 'mock_id_token',
            access_token: 'mock_access_token'
          })

        nock('https://www.googleapis.com')
          .get('/oauth2/v1/userinfo')
          .query({ alt: 'json', access_token: 'mock_access_token' })
          .reply(200, {
            email: 'google@test.com',
            name: 'Google User',
            verified_email: true
          })

        await api
          .get(`/api/auth/google/callback?code=${mockCode}`)
          .expect(302)

        const usersAtEnd = await getUsersInDb()
        const users = await User.find({ email: 'google@test.com' })
        assert.strictEqual(users.length, 1)
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
        assert.strictEqual(users[0].username, 'existing-google-user')
      })

    })

    describe('GitHub OAuth Flow', () => {
      test('redirects to GitHub OAuth URL with correct parameters', async () => {
        const response = await api
          .get('/api/auth/github')
          .expect(302)

        const location = response.headers.location
        assert(location.startsWith('https://github.com/login/oauth/authorize'))
        assert(location.includes('redirect_uri='))
        const url = new URL(location)
        assert.deepStrictEqual(JSON.parse(url.searchParams.get('state')), {})
      })

      test('handles CLI mode signin correctly', async () => {
        const response = await api
          .get('/api/auth/github?mode=cli&redirect=http://localhost:3000/')
          .expect(302)

        const location = response.headers.location
        assert(location.startsWith('https://github.com/login/oauth/authorize'))
        assert(location.includes('redirect_uri='))
        const url = new URL(location)
        const state = JSON.parse(url.searchParams.get('state'))
        assert.deepStrictEqual(state, { mode: 'cli', redirect: 'http://localhost:3000/' })
      })

      test('creates new user on first GitHub login', async () => {
        const mockCode = 'valid_mock_auth_code'

        nock('https://github.com')
          .post('/login/oauth/access_token')
          .reply(200, {
            access_token: 'mock_github_token'
          })

        nock('https://api.github.com')
          .get('/user')
          .reply(200, {
            login: 'githubuser',
            id: 12345
          })

        nock('https://api.github.com')
          .get('/user/emails')
          .reply(200, [{
            email: 'github@test.com',
            primary: true,
            verified: true
          }])

        const response = await api
          .get(`/api/auth/github/callback?code=${mockCode}`)
          .expect(302)

        assert(response.headers.location.startsWith(config.UI_URI + '/oauth/callback'))

        const cookies = response.headers['set-cookie']
        assert(cookies.some(cookie => cookie.includes('accessToken')))
        assert(cookies.some(cookie => cookie.includes('refreshToken')))

        const user = await User.findOne({ email: 'github@test.com' })
        assert(user)
        assert.strictEqual(user.provider, 'github')
        assert.strictEqual(user.username, 'githubuser')
        assert(user.oauth)
      })

      test('handles CLI mode in GitHub callback', async () => {
        const mockCode = 'valid_mock_auth_code'
        const mockState = JSON.stringify({
          mode: 'cli',
          redirect: 'http://localhost:3000/callback'
        })

        nock('https://github.com')
          .post('/login/oauth/access_token')
          .reply(200, {
            access_token: 'mock_github_token'
          })

        nock('https://api.github.com')
          .get('/user')
          .reply(200, {
            login: 'githubuser',
            id: 12345
          })

        nock('https://api.github.com')
          .get('/user/emails')
          .reply(200, [{
            email: 'github@test.com',
            primary: true,
            verified: true
          }])


        const response = await api
          .get(`/api/auth/github/callback?code=${mockCode}&state=${mockState}`)
          .expect(302)

        assert(response.headers.location.startsWith('http://localhost:3000/callback?token='))
        const cookies = response.headers['set-cookie']
        assert(!cookies)
      })

      test('handles errors in GitHub OAuth flow', async () => {
        const mockCode = 'invalid_code'

        nock('https://github.com')
          .post('/login/oauth/access_token')
          .replyWithError('Invalid authorization code')

        const response = await api
          .get(`/api/auth/github/callback?code=${mockCode}`)
          .expect(500)
        assert(response.body.error.includes('Error during GitHub OAuth callback'))
      })

      test('reuses existing GitHub user on subsequent logins', async () => {
        await User.create({
          email: 'github@test.com',
          username: 'existing-github-user',
          provider: 'github',
          passwordHash: 'dummy',
          oauth: true
        })

        const usersAtStart = await getUsersInDb()

        const mockCode = 'valid_mock_auth_code'

        nock('https://github.com')
          .post('/login/oauth/access_token')
          .reply(200, {
            access_token: 'mock_github_token'
          })

        nock('https://api.github.com')
          .get('/user')
          .reply(200, {
            login: 'githubuser',
            id: 12345
          })

        nock('https://api.github.com')
          .get('/user/emails')
          .reply(200, [{
            email: 'github@test.com',
            primary: true,
            verified: true
          }])

        await api
          .get(`/api/auth/github/callback?code=${mockCode}`)
          .expect(302)

        const usersAtEnd = await getUsersInDb()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
        const users = await User.find({ email: 'github@test.com' })
        assert.strictEqual(users.length, 1)
        assert.strictEqual(users[0].username, 'existing-github-user')
      })
    })
  })

  after(async () => {
    await clearDatabase()
    await mongoose.connection.close()
  })
})
