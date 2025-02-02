const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const Note = require('../models/note')
const config = require('../utils/config')
const { test, describe, beforeEach, after, before } = require('node:test')

// Connect to test database before tests
before(async () => {
  await mongoose.connect(config.MONGODB_URI)
})

// Close database connection after tests
after(async () => {
  await mongoose.connection.close()
})

const api = supertest(app)

// Sample data for tests
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

const initialNotes = [
  {
    title: 'First test note',
    content: '# Test Content\nThis is a test note',
    tags: ['test', 'first']
  },
  {
    title: 'Second test note',
    content: '# Another Test\nThis is another test note',
    tags: ['test', 'second']
  }
]

// Helper functions
const clearDatabase = async () => {
  await User.deleteMany({})
  await Note.deleteMany({})
}

const getUsersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

const getNotesInDb = async () => {
  const notes = await Note.find({})
  return notes.map(note => note.toJSON())
}

const getAuthCookie = async () => {
  // Create a test user
  await api
    .post('/api/auth/signup')
    .send(initialUsers[0])

  // Sign in to get auth cookies
  const response = await api
    .post('/api/auth/signin')
    .send({
      email: initialUsers[0].email,
      password: initialUsers[0].password
    })

  // Extract cookies from response
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

// For testing OAuth flows
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
  initialNotes,
  clearDatabase,
  getUsersInDb,
  getNotesInDb,
  getAuthCookie,
  createTestUser,
  createTestNote,
  mockGoogleProfile,
  mockGithubProfile
} 