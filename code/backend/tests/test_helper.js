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


module.exports = {
  api,
  initialUsers,
  clearDatabase,
  getUsersInDb,
}
