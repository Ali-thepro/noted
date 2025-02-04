const mongoose = require('mongoose')
const assert = require('node:assert')
const { describe, test, beforeEach, afterEach, after } = require('node:test')
const { api, clearDatabase, initialUsers } = require('./test_helper')
const fs = require('fs')
const path = require('path')
const AWS = require('aws-sdk')

const tempFilePath = path.join(__dirname, 'temp_test_image.png')

describe('Image Upload API (POST /api/image/upload)', () => {
  let cookies
  let originalS3Upload

  beforeEach(async () => {
    await clearDatabase()
    fs.writeFileSync(tempFilePath, 'dummy image content')
    originalS3Upload = AWS.S3.prototype.upload
    AWS.S3.prototype.upload = function (params, callback) {
      callback(null, { Location: 'https://example.com/mock-upload.png' })
    }
    await api.post('/api/auth/signup').send(initialUsers[0])
    const response = await api
      .post('/api/auth/signin')
      .send({
        email: initialUsers[0].email,
        password: initialUsers[0].password,
      })

    cookies = response.headers['set-cookie']
  })

  afterEach(async () => {
    AWS.S3.prototype.upload = originalS3Upload
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath)
    }
  })

  test('succeeds with valid user session and file uploaded', async () => {
    const uploadResponse = await api
      .post('/api/image/upload')
      .set('Cookie', cookies.join('; '))
      .attach('image', tempFilePath)
      .expect(200)

    assert.strictEqual(uploadResponse.body.imageUrl,'https://example.com/mock-upload.png')
  })

  test('fails if not authenticated', async () => {
    const uploadResponse = await api
      .post('/api/image/upload')
      .attach('image', tempFilePath)
      .expect(401)

    assert.strictEqual(uploadResponse.body.error, 'Unauthorised - No token, please re-authenticate')
  })

  test('fails if no file is provided', async () => {
    const uploadResponse = await api
      .post('/api/image/upload')
      .set('Cookie', cookies.join('; '))
      .expect(400)

    assert.strictEqual(uploadResponse.body.error, 'No file uploaded')
  })

  test('handles S3 upload error gracefully (returns 500)', async () => {
    AWS.S3.prototype.upload = function (params, callback) {
      callback(new Error('Simulated S3 failure'), null)
    }
    const uploadResponse = await api
      .post('/api/image/upload')
      .set('Cookie', cookies.join('; '))
      .attach('image', tempFilePath)
      .expect(500)

    assert.strictEqual(uploadResponse.body.error, 'Upload to S3 failed')
  })
})
after(async () => {
  await clearDatabase()
  await mongoose.connection.close()
})
