const Version = require('../models/version')
const Note = require('../models/note')
const createError = require('../utils/error')

const createVersion = async (request, response, next) => {
  const { noteId } = request.params
  const { type, content, metadata } = request.body
  const user = request.user

  try {
    const note = await Note.findOne({ _id: noteId, user: user.id })
    if (!note) {
      return next(createError('Note not found or unauthorized', 404))
    }

    let baseVersionId = null
    if (type === 'diff') {
      const latestVersion = await Version.findOne({ noteId })
        .sort({ createdAt: -1 })

      if (!latestVersion) {
        return next(createError('No base version found for diff', 400))
      }
      baseVersionId = latestVersion._id
    }

    const version = new Version({
      noteId,
      type,
      content,
      metadata: {
        ...metadata,
        timestamp: new Date()
      },
      ...(baseVersionId && { baseVersionId })
    })

    const savedVersion = await version.save()
    response.status(201).json(savedVersion)
  } catch (error) {
    next(error)
  }
}

const getVersionChain = async (request, response, next) => {
  const { noteId } = request.params
  const { until } = request.query
  const user = request.user

  try {
    const note = await Note.findOne({ _id: noteId, user: user.id })
    if (!note) {
      return next(createError('Note not found or unauthorized', 404))
    }

    let query = { noteId }
    if (until) {
      query.createdAt = { $lte: new Date(until) }
    }

    const versions = await Version.find(query)
      .sort({ createdAt: -1 })
      .populate('baseVersionId')

    if (versions.length === 0) {
      return next(createError('No versions found', 404))
    }

    const versionChain = []
    let currentVersion = versions[0]

    while (currentVersion) {
      versionChain.unshift(currentVersion)
      if (currentVersion.type === 'snapshot') {
        break
      }
      currentVersion = currentVersion.baseVersionId
    }

    response.json(versionChain)
  } catch (error) {
    next(error)
  }
}

const getVersions = async (request, response, next) => {
  const { noteId } = request.params
  const user = request.user

  try {
    const note = await Note.findOne({ _id: noteId, user: user.id })
    if (!note) {
      return next(createError('Note not found or unauthorized', 404))
    }

    const versions = await Version.find({ noteId })
      .sort({ createdAt: -1 })
      .select('-content')

    response.json(versions)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createVersion,
  getVersionChain,
  getVersions
}
