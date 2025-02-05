const mongoose = require('mongoose')
const assert = require('node:assert')
const { test, describe, beforeEach, after } = require('node:test')
const { api, clearDatabase, initialNotes, getNotesInDb, initialUsers } = require('./test_helper')
const Note = require('../models/note')


describe('Note API', () => {
  let authCookie
  let userId

  beforeEach(async () => {
    await clearDatabase()

    const response = await api.post('/api/auth/signup').send(initialUsers[0])
    userId = response.body.id
    authCookie = response.headers['set-cookie']

    for (const note of initialNotes) {
      await api
        .post('/api/note/create')
        .set('Cookie', authCookie)
        .send(note)
    }
  })

  describe('Getting notes (GET /api/note/get)', () => {
    test('returns all notes for authenticated user', async () => {
      const response = await api
        .get('/api/note/get')
        .set('Cookie', authCookie)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.notes.length, initialNotes.length)
      assert.strictEqual(response.body.total, initialNotes.length)
    })

    test('supports pagination and sorting', async () => {
      const response = await api
        .get('/api/note/get?startIndex=0&limit=1&sortBy=updatedAt&sortOrder=desc')
        .set('Cookie', authCookie)
        .expect(200)

      assert.strictEqual(response.body.notes.length, 1)
      assert.strictEqual(response.body.total, initialNotes.length)
    })

    test('supports tag filtering', async () => {
      const response = await api
        .get('/api/note/get?tag=first')
        .set('Cookie', authCookie)
        .expect(200)

      assert.strictEqual(response.body.notes.length, 1)
      assert.strictEqual(response.body.notes[0].title, initialNotes[0].title)
    })

    test('supports search functionality', async () => {
      const response = await api
        .get('/api/note/get?search=first')
        .set('Cookie', authCookie)
        .expect(200)

      assert.strictEqual(response.body.notes.length, 1)
      assert.strictEqual(response.body.notes[0].title, initialNotes[0].title)
    })

    test('fails without authentication', async () => {
      await api
        .get('/api/note/get')
        .expect(401)
    })
  })

  after(async () => {
    await clearDatabase()
    await mongoose.connection.close()
  })
})