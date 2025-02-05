const mongoose = require('mongoose')
const assert = require('node:assert')
const { test, describe, beforeEach, after } = require('node:test')
const { api, clearDatabase, initialNotes, getNotesInDb, initialUsers } = require('./test_helper')


describe('Note API', () => {
  let authCookie

  beforeEach(async () => {
    await clearDatabase()

    const response = await api.post('/api/auth/signup').send(initialUsers[0])
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

      assert(Array.isArray(response.body.notes))
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

  describe('Getting a single note (GET /api/note/get/:id)', () => {
    test('succeeds with valid id', async () => {
      const notesInDb = await getNotesInDb()
      const noteToView = notesInDb[0]

      const response = await api
        .get(`/api/note/get/${noteToView.id}`)
        .set('Cookie', authCookie)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.title, noteToView.title)
    })

    test('fails with status code 404 if note does not exist', async () => {
      const nonExistingId = new mongoose.Types.ObjectId()

      const response = await api
        .get(`/api/note/get/${nonExistingId}`)
        .set('Cookie', authCookie)
        .expect(404)

      assert.strictEqual(response.body.error, 'Note not found or unauthorized')
    })
  })

  describe('Note creation (POST /api/note/create)', () => {
    test('succeeds with valid data', async () => {
      const newNote = {
        title: 'Test note creation',
        content: 'Testing note creation functionality',
        tags: ['test', 'creation']
      }

      await api
        .post('/api/note/create')
        .set('Cookie', authCookie)
        .send(newNote)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const notesAtEnd = await getNotesInDb()
      assert.strictEqual(notesAtEnd.length, initialNotes.length + 1)

      const titles = notesAtEnd.map(n => n.title)
      assert(titles.includes(newNote.title))
    })

    test('fails with invalid data', async () => {
      const newNote = {
        title: 'a'.repeat(101),
        content: 'Test content'
      }

      await api
        .post('/api/note/create')
        .set('Cookie', authCookie)
        .send(newNote)
        .expect(400)

      const notesAtEnd = await getNotesInDb()
      assert.strictEqual(notesAtEnd.length, initialNotes.length)
    })
  })

  describe('Note update (PUT /api/note/update/:id)', () => {
    test('succeeds with valid data', async () => {
      const notesAtStart = await getNotesInDb()
      const noteToUpdate = notesAtStart[0]

      const updatedNote = {
        title: 'Updated title',
        content: 'Updated content',
        tags: ['updated']
      }

      await api
        .put(`/api/note/update/${noteToUpdate.id}`)
        .set('Cookie', authCookie)
        .send(updatedNote)
        .expect(200)

      const notesAtEnd = await getNotesInDb()
      const updatedNoteInDb = notesAtEnd.find(n => n.id === noteToUpdate.id)
      assert.strictEqual(updatedNoteInDb.title, updatedNote.title)
    })

    test('fails with invalid id', async () => {
      const invalidId = new mongoose.Types.ObjectId()
      const updatedNote = {
        title: 'Updated title',
        content: 'Updated content'
      }

      const response = await api
        .put(`/api/note/update/${invalidId}`)
        .set('Cookie', authCookie)
        .send(updatedNote)
        .expect(404)

      assert.strictEqual(response.body.error, 'Note not found or unauthorized')
    })
  })

  describe('Note deletion (DELETE /api/note/delete/:id)', () => {
    test('succeeds with valid id', async () => {
      const notesAtStart = await getNotesInDb()
      const noteToDelete = notesAtStart[0]

      await api
        .delete(`/api/note/delete/${noteToDelete.id}`)
        .set('Cookie', authCookie)
        .expect(204)

      const notesAtEnd = await getNotesInDb()
      assert.strictEqual(notesAtEnd.length, notesAtStart.length - 1)
      assert(!notesAtEnd.map(n => n.id).includes(noteToDelete.id))
    })

    test('fails with invalid id', async () => {
      const invalidId = new mongoose.Types.ObjectId()

      const response = await api
        .delete(`/api/note/delete/${invalidId}`)
        .set('Cookie', authCookie)
        .expect(404)

      assert.strictEqual(response.body.error, 'Note not found or unauthorized')
    })
  })

  describe('Note metadata (GET /api/note/metadata)', () => {
    test('returns correct metadata', async () => {
      const response = await api
        .get('/api/note/metadata')
        .set('Cookie', authCookie)
        .expect(200)

      assert(Array.isArray(response.body))
      assert(response.body.every(note =>
        note.id &&
        note.title &&
        note.tags &&
        note.updatedAt &&
        note.createdAt
      ))
    })

    test('supports since parameter', async () => {
      const since = new Date(Date.now() - 1000).toISOString()
      const response = await api
        .get(`/api/note/metadata?since=${since}`)
        .set('Cookie', authCookie)
        .expect(200)

      assert(response.body.every(note => new Date(note.updatedAt) >= new Date(since)))
    })

    test('supports tag filtering', async () => {
      const response = await api
        .get('/api/note/metadata?tag=first')
        .set('Cookie', authCookie)
        .expect(200)

      assert(response.body.every(note => note.tags.includes('first')))
    })
  })

  describe('Bulk notes retrieval (POST /api/note/bulk)', () => {
    test('returns specified notes', async () => {
      const notesInDb = await getNotesInDb()
      const noteIds = notesInDb.map(note => note.id)

      const response = await api
        .post('/api/note/bulk')
        .set('Cookie', authCookie)
        .send({ ids: noteIds })
        .expect(200)


      assert(Array.isArray(response.body))
      assert.strictEqual(response.body.length, noteIds.length)
      assert(response.body.every(note =>
        noteIds.includes(note.id)
      ))
    })

    test('fails with invalid request format', async () => {
      const response = await api
        .post('/api/note/bulk')
        .set('Cookie', authCookie)
        .send({ ids: 'not-an-array' })
        .expect(400)

      assert.strictEqual(response.body.error, 'Invalid request : ids must be an array')
    })
  })


  describe('Deleted notes (GET /api/note/deleted)', () => {
    test('returns deleted notes metadata', async () => {
      const notesAtStart = await getNotesInDb()
      const noteToDelete = notesAtStart[0]

      await api
        .delete(`/api/note/delete/${noteToDelete.id}`)
        .set('Cookie', authCookie)
        .expect(204)

      const response = await api
        .get('/api/note/deleted')
        .set('Cookie', authCookie)
        .expect(200)

      assert(Array.isArray(response.body))
      assert(response.body.some(note =>
        note.noteId === noteToDelete.id
      ))
    })

    test('supports since parameter', async () => {
      const since = new Date(Date.now() - 1000).toISOString()
      const response = await api
        .get(`/api/note/deleted?since=${since}`)
        .set('Cookie', authCookie)
        .expect(200)

      assert(response.body.every(note => new Date(note.deletedAt) >= new Date(since)))
    })

    test('supports tag filtering', async () => {
      const response = await api
        .get('/api/note/deleted?tag=first')
        .set('Cookie', authCookie)
        .expect(200)

      assert(response.body.every(note => note.tags.includes('first')))
    })
  })

  after(async () => {
    await clearDatabase()
    await mongoose.connection.close()
  })
})
