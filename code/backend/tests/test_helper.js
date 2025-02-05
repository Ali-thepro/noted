const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const Note = require('../models/note')
const DeletedNote = require('../models/deletedNote')
const Version = require('../models/version')

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

const initialNotes = [
  {
    title: 'First test note',
    content: 'Content of first note',
    tags: ['test', 'first']
  },
  {
    title: 'Second test note',
    content: 'Content of second note',
    tags: ['test', 'second']
  }
]

const initialVersions = [
  {
    type: 'snapshot',
    content: 'Initial content snapshot',
    metadata: {
      title: 'First test note',
      tags: ['test', 'first'],
      versionNumber: 1
    }
  },
  {
    type: 'diff',
    content: 'Some diff content',
    metadata: {
      title: 'First test note updated',
      tags: ['test', 'first', 'updated'],
      versionNumber: 2
    }
  }
]

const clearDatabase = async () => {
  await User.deleteMany({})
  await Note.deleteMany({})
  await DeletedNote.deleteMany({})
  await Version.deleteMany({})
}

const getUsersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

const getNotesInDb = async () => {
  const notes = await Note.find({})
  return notes.map(note => note.toJSON())
}

module.exports = {
  api,
  initialUsers,
  initialNotes,
  initialVersions,
  clearDatabase,
  getUsersInDb,
  getNotesInDb,
}
