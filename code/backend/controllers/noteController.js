const Note = require('../models/note')
const createError = require('../utils/error')

const getNotes = async (request, response, next) => {
  const user = request.user
  const { tag, search } = request.query

  try {
    let query = { user: user.id }

    if (tag) {
      query.tags = tag
    }

    if (search) {
      query.$text = { $search: search }
    }

    const notes = await Note.find(query).sort({ updatedAt: -1 })
    response.json(notes)
  } catch (error) {
    next(error)
  }
}

const getNote = async (request, response, next) => {
  const { id } = request.params
  const user = request.user

  try {
    const note = await Note.findOne({ _id: id, user: user.id })
    if (!note) {
      return next(createError('Note not found or unauthorized', 404))
    }

    response.json(note)
  } catch (error) {
    next(error)
  }
}

const createNote = async (request, response, next) => {
  const user = request.user
  const { title, content, tags } = request.body

  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      user: user.id
    })

    const savedNote = await note.save()
    response.status(201).json(savedNote)
  } catch (error) {
    next(error)
  }
}

const updateNote = async (request, response, next) => {
  const { id } = request.params
  const user = request.user
  const { title, content, tags } = request.body

  try {
    const note = await Note.findOne({ _id: id, user: user.id })
    if (!note) {
      return next(createError('Note not found or unauthorized', 404))
    }

    note.title = title
    note.content = content
    note.tags = tags || []

    const updatedNote = await note.save()
    response.json(updatedNote)
  } catch (error) {
    next(error)
  }
}

/*

const updateNote = async (request, response, next) => {
  const { id } = request.params
  const user = request.user
  const { title, content, tags } = request.body

  try {
    const updatedNote = await Note.findOneAndUpdate(
      { _id: id, user: user.id },
      { $set: { title, content, tags } },
      { new: true, runValidators: true }
    )

    if (!updatedNote) {
      return next(createError('Note not found or unauthorized', 404))
    }

    response.json(updatedNote)
  } catch (error) {
    next(error)
  }
}
*/


const deleteNote = async (request, response, next) => {
  const { id } = request.params
  const user = request.user

  try {
    const note = await Note.findOne({ _id: id, user: user.id })
    if (!note) {
      return next(createError('Note not found or unauthorized', 404))
    }

    await Note.findByIdAndDelete(id)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote
}
