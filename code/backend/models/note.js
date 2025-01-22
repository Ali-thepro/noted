const mongoose = require('mongoose')

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    content: {
      type: String,
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
)

noteSchema.path('tags').validate(function (value) {
  const uniqueTags = new Set(value)
  return value.length === uniqueTags.size
}, 'Tags must be unique')

noteSchema.path('tags').validate(function (value) {
  return value.every(tag => tag.length <= 20)
}, 'Tags cannot be more than 20 characters')

noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Note', noteSchema)
