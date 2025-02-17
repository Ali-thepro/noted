import { http, HttpResponse } from 'msw'

const hostname = '/api'

export const handlers = [

  http.get(`${hostname}/note/:id`, () => {
    return HttpResponse.json({
      id: '123',
      title: 'Test Note',
      content: '# Test Content',
      userId: '1'
    })
  }),

  http.post(`${hostname}/note/create`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      id: '123',
      title: body.title,
      content: body.content,
      tags: body.tags,
      userId: '1',
      updatedAt: new Date().toISOString()
    })
  }),

  http.post(`${hostname}/auth/signin`, async ({ request }) => {
    const body = await request.json()
    if (body.email === 'test@test.com' && body.password === 'password123') {
      return HttpResponse.json({
        id: '1',
        username: 'testuser',
        email: 'test@test.com',
        oauth: false,
        provider: 'local'
      })
    }
    return new HttpResponse(
      JSON.stringify({ error: 'Invalid credentials' }),
      { status: 401 }
    )
  }),

  http.post(`${hostname}/auth/signup`, async ({ request }) => {
    const body = await request.json()
    if (
      body.email === 'newuser@test.com' &&
      body.password === 'password123' &&
      body.username === 'newuser'
    ) {
      return HttpResponse.json({
        id: '2',
        username: 'newuser',
        email: 'newuser@test.com',
        oauth: false,
        provider: 'local'
      })
    }
    return new HttpResponse(
      JSON.stringify({ error: 'Registration failed' }),
      { status: 400 }
    )
  }),

  http.post(`${hostname}/auth/signout`, () => {
    return HttpResponse.json({ message: 'Signed out successfully' })
  }),

  http.get(`${hostname}/version/:noteId`, () => {
    return HttpResponse.json({
      id: '1',
      type: 'snapshot',
      content: '# Test Content',
      metadata: {
        versionNumber: 1,
        title: 'Test Note',
        tags: []
      },
      createdAt: new Date().toISOString()
    })
  }),

  http.post(`${hostname}/version/:noteId`, () => {
    return HttpResponse.json({
      id: '456',
      type: 'snapshot',
      content: '# Test Content',
      metadata: {
        versionNumber: 1,
        title: 'Test Note',
        tags: []
      }
    })
  }),

  http.get(`${hostname}/encryption/password`, () => {
    return HttpResponse.json({
      password: 'password123'
    })
  })
]
