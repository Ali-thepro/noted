const mongoose = require('mongoose')
const assert = require('node:assert')
const { test, describe, beforeEach, after } = require('node:test')
const { api, clearDatabase, initialVersions, initialNotes, setupTestUser } = require('./test_helper')

describe('Version API', () => {
  let authCookie
  let baseVersionId
  let noteId

  beforeEach(async () => {
    await clearDatabase()

    authCookie = await setupTestUser()

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
        },
        cipherKey: 'dummyCipherKey',
        cipherIv: 'dummyCipherIv',
        contentIv: 'dummyContentIv'
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
        },
        cipherKey: 'dummyCipherKey',
        cipherIv: 'dummyCipherIv',
        contentIv: 'dummyContentIv'
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
        content: 'Some content',
        cipherKey: 'dummyCipherKey',
        cipherIv: 'dummyCipherIv',
        contentIv: 'dummyContentIv'
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

  describe('Getting version chain (GET /api/version/:noteId/chain)', () => {
    beforeEach(async () => {
      await api
        .post(`/api/version/${noteId}`)
        .set('Cookie', authCookie)
        .send({
          ...initialVersions[1],
          baseVersion: baseVersionId
        })
    })

    test('returns complete version chain', async () => {
      const response = await api
        .get(`/api/version/${noteId}/chain`)
        .set('Cookie', authCookie)
        .expect(200)

      assert(Array.isArray(response.body))
      assert.strictEqual(response.body.length, 2)
      assert.strictEqual(response.body[0].type, 'snapshot')
      assert.strictEqual(response.body[1].type, 'diff')
    })

    test('supports until parameter', async () => {
      const until = new Date().toISOString()
      const response = await api
        .get(`/api/version/${noteId}/chain?until=${until}`)
        .set('Cookie', authCookie)
        .expect(200)

      assert(response.body.every(version => new Date(version.createdAt) <= new Date(until)))
    })

    test('fails with invalid note id', async () => {
      const invalidNoteId = new mongoose.Types.ObjectId()

      const response = await api
        .get(`/api/version/${invalidNoteId}/chain`)
        .set('Cookie', authCookie)
        .expect(404)

      assert.strictEqual(response.body.error, 'Note not found or unauthorized')
    })

    test('fails when no versions exist', async () => {
      await clearDatabase()

      const authCookie = await setupTestUser()

      const noteResponse = await api
        .post('/api/note/create')
        .set('Cookie', authCookie)
        .send(initialNotes[0])

      const response = await api
        .get(`/api/version/${noteResponse.body.id}/chain`)
        .set('Cookie', authCookie)
        .expect(404)

      assert.strictEqual(response.body.error, 'No versions found')
    })
  })

  describe('Getting versions (GET /api/version/:noteId)', () => {
    test('returns all versions for a note', async () => {
      await api
        .post(`/api/version/${noteId}`)
        .set('Cookie', authCookie)
        .send({
          ...initialVersions[1],
          baseVersion: baseVersionId
        })

      const response = await api
        .get(`/api/version/${noteId}`)
        .set('Cookie', authCookie)
        .expect(200)

      assert(Array.isArray(response.body))
      assert.strictEqual(response.body.length, 2)
      assert(response.body.some(v => v.type === 'snapshot'))
      assert(response.body.some(v => v.type === 'diff'))
    })

    test('fails with invalid note id', async () => {
      const invalidNoteId = new mongoose.Types.ObjectId()

      const response = await api
        .get(`/api/version/${invalidNoteId}`)
        .set('Cookie', authCookie)
        .expect(404)

      assert.strictEqual(response.body.error, 'Note not found or unauthorized')
    })
  })

  after(async () => {
    await clearDatabase()
    await mongoose.connection.close()
  })
})
