const bcrypt = require('bcrypt')
const User = require('../models/user')
const createError = require('../utils/error')



const signup = async (request, response, next) => {
  const { username, email, password, confirmPassword } = request.body

  if (
    !username ||
    !email ||
    !password ||
    !confirmPassword ||
    username === '' ||
    email === '' ||
    password === '' ||
    confirmPassword === ''
  ) {
    return next(createError('All fields are required', 400))
  }

  if (password !== confirmPassword) {
    return next(createError('Passwords do not match', 400))
  }

  if (
    !password ||
    password.length < 8 ||
    !/\d/.test(password) ||
    !/[a-zA-Z]/.test(password)
  ) {
    return next(createError('Password must be at least 8 characters long and must contain at least one number and one letter',400))
  }

  const existingUser = await User.findOne({ email, provider: 'local' })
  if (existingUser) {
    return next(createError('An account with this email already exists', 400))
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    email,
    passwordHash,
    provider: 'local',
  })

  const savedUser = await user.save()
  response.status(201).json(savedUser)
}


module.exports = {
  signup,
}