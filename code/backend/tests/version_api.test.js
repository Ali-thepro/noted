const mongoose = require('mongoose')
const assert = require('node:assert')
const { test, describe, beforeEach, after } = require('node:test')
const { api, clearDatabase, initialVersions, initialUsers, initialNotes } = require('./test_helper')

describe('Version API', () => {
  let authCookie
  let baseVersionId
  let noteId

  beforeEach(async () => {
    await clearDatabase()

    const response = await api.post('/api/auth/signup').send(initialUsers[0])
    authCookie = response.headers['set-cookie']

    const noteResponse = await api
      .post('/api/note/create')
      .set('Cookie', authCookie)
      .send(initialNotes[0])
    noteId = noteResponse.body.id

    const snapshotResponse = await api
      .post(`/api/version/${noteId}`)
      .set('Cookie', authCookie)
      .send(initialVersions[0])
    baseVersionId = snapshotResponse.body.id
  })

  describe('Version creation (POST /api/version/:noteId)', () => {
    test('creates a snapshot version successfully', async () => {
      const newVersion = {
        type: 'snapshot',
        content: 'New snapshot content',
        metadata: {
          title: 'Updated title',
          tags: ['new', 'tags']
        }
      }

      const response = await api
        .post(`/api/version/${noteId}`)
        .set('Cookie', authCookie)
        .send(newVersion)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.type, 'snapshot')
      assert.strictEqual(response.body.content, newVersion.content)
      assert.deepStrictEqual(response.body.metadata.tags, newVersion.metadata.tags)
    })

    test('creates a diff version successfully', async () => {
      const newVersion = {
        type: 'diff',
        content: 'Some diff content',
        baseVersion: baseVersionId,
        metadata: {
          title: 'Updated title',
          tags: ['new', 'tags']
        }
      }

      const response = await api
        .post(`/api/version/${noteId}`)
        .set('Cookie', authCookie)
        .send(newVersion)
        .expect(201)

      assert.strictEqual(response.body.type, 'diff')
      assert.strictEqual(response.body.baseVersion, baseVersionId)
    })

    test('fails with invalid note id', async () => {
      const invalidNoteId = new mongoose.Types.ObjectId()

      const response = await api
        .post(`/api/version/${invalidNoteId}`)
        .set('Cookie', authCookie)
        .send(initialVersions[0])
        .expect(404)

      assert.strictEqual(response.body.error, 'Note not found or unauthorized')
    })

    test('fails with invalid version type', async () => {
      const invalidVersion = {
        type: 'invalid',
        content: 'Some content'
      }

      const response = await api
        .post(`/api/version/${noteId}`)
        .set('Cookie', authCookie)
        .send(invalidVersion)
        .expect(400)

      assert.strictEqual(response.body.error, 'Version validation failed: type: `invalid` is not a valid enum value for path `type`.')
    })

    test('fails when diff version missing baseVersion', async () => {
      const invalidDiff = {
        type: 'diff',
        content: 'Some diff content'
      }

      await api
        .post(`/api/version/${noteId}`)
        .set('Cookie', authCookie)
        .send(invalidDiff)
        .expect(400)
    })
  })

  after(async () => {
    await clearDatabase()
    await mongoose.connection.close()
  })
})
