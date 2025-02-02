const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')

const api = supertest(app)

const initialUsers = [
  {
    username: 'testuser',
    email: 'test@test.com',
    password: 'Password123',
    confirmPassword: 'Password123'
  },
  {
    username: 'anotheruser',
    email: 'another@test.com',
    password: 'Password456',
    confirmPassword: 'Password456'
  }
]

const clearDatabase = async () => {
  await User.deleteMany({})
}

const getUsersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

const getAuthCookie = async () => {
  await api
    .post('/api/auth/signup')
    .send(initialUsers[0])

  const response = await api
    .post('/api/auth/signin')
    .send({
      email: initialUsers[0].email,
      password: initialUsers[0].password
    })

  const cookies = response.headers['set-cookie']
  return cookies.join('; ')
}

const createTestUser = async (userData = initialUsers[0]) => {
  const response = await api
    .post('/api/auth/signup')
    .send(userData)

  return response.body
}

const createTestNote = async (noteData, authCookie) => {
  const response = await api
    .post('/api/notes')
    .set('Cookie', authCookie)
    .send(noteData)

  return response.body
}

const mockGoogleProfile = {
  email: 'google@test.com',
  name: 'Google User',
  id: '123456789'
}

const mockGithubProfile = {
  email: 'github@test.com',
  login: 'githubuser',
  id: '987654321'
}

module.exports = {
  api,
  initialUsers,
  clearDatabase,
  getUsersInDb,
  getAuthCookie,
  createTestUser,
  createTestNote,
  mockGoogleProfile,
  mockGithubProfile
}
