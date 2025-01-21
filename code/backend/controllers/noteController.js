const Note = require('../models/note')
const createError = require('../utils/error')

const getNotes = async (request, response, next) => {
  const { tag, search } = request.query
  const user = request.user

  try {
    const filter = {
      user: user.id,
      ...(tag ? {
          tags: {
            $regex: tag,
            $options: 'i',
          },
        } : {}),
      ...(search ? {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } },
          ],
        } : {}),
    }

    const startIndex = parseInt(request.query.startIndex) || 0
    const limit = parseInt(request.query.limit) || 9
    const sortBy = request.query.sortBy || 'updatedAt'
    const sortOrder = request.query.sortOrder === 'asc' ? 1 : -1

    const total = await Note.countDocuments(filter)
    const notes = await Note.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(startIndex)
      .limit(limit)
    response.json({ notes, total })
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

// const updateNote = async (request, response, next) => {
//   const { id } = request.params
//   const user = request.user
//   const { title, content, tags } = request.body

//   try {
//     const note = await Note.findOne({ _id: id, user: user.id })
//     if (!note) {
//       return next(createError('Note not found or unauthorized', 404))
//     }

//     note.title = title
//     note.content = content
//     note.tags = tags || []

//     const updatedNote = await note.save()
//     response.json(updatedNote)
//   } catch (error) {
//     next(error)
//   }
// }


const updateNote = async (request, response, next) => {
  const { id } = request.params
  const user = request.user

  const title = request.body.title
  const content = request.body.content
  const tags = request.body.tags

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
