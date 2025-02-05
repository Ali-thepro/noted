const mongoose = require('mongoose')

const versionSchema = new mongoose.Schema({
  noteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
    required: true
  },
  type: {
    type: String,
    enum: ['diff', 'snapshot'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  baseVersion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Version',
    required: function() { return this.type === 'diff' }
  },
  metadata: {
    title: String,
    tags: [String],
    versionNumber: Number,
  }
}, { timestamps: true })

versionSchema.index({ noteId: 1, createdAt: -1 })
versionSchema.index({ noteId: 1, type: 1 })

versionSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Version', versionSchema)
