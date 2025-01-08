const bcrypt = require('bcrypt')
const User = require('../models/user')
const createError = require('../utils/error')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')
const axios = require('axios')


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



const signin = async (request, response, next) => {
  const { email, password } = request.body

  if (!email || !password) {
    return next(createError('Email and password are required', 400))
  }

  const user = await User.findOne({ email })
  const passwordCorrect = user === null ? false : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return next(createError('Invalid email or password', 401))
  }

  const userForToken = {
    email: user.email,
    id: user._id,
  }

  const token = jwt.sign(userForToken, config.SECRET, { expiresIn: 7200 })

  response
    .status(200)
    .cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
    })
    .json(user)
}

function getGoogleAuthURL() {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
  const options = {
    redirect_uri: config.GOOGLE_REDIRECT_URI,
    client_id: config.GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  }

  const queryOptions = new URLSearchParams(options).toString()

  return `${rootUrl}?${queryOptions}`

}

const googleOauth = (request, response) => {
  const googleAuthURL = getGoogleAuthURL()
  response.redirect(googleAuthURL)
}


const google = async (request, response, next) => {
  const code = request.query.code

  try {
    const { data } = await axios({
      url: 'https://oauth2.googleapis.com/token',
      method: 'post',
      data: {
        client_id: config.GOOGLE_CLIENT_ID,
        client_secret: config.GOOGLE_CLIENT_SECRET,
        redirect_uri: config.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
        code,
      },
    })
    const { id_token, access_token } = data

    const { data: userProfile } = await axios({
      url: `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      method: 'get',
      headers: {
        Authorization: `Bearer ${id_token}`,
      },
    })

    const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(generatedPassword, saltRounds)

    let user = await User.findOne({ email: userProfile.email, provider: 'google' })
    if (!user) {
      const username = userProfile.name.replace(/\s+/g, '-') // Replace spaces with hyphens
      user = await User.create({
        email: userProfile.email,
        username: username,
        provider: 'google',
        passwordHash,
        oauth: true,
      })
    }

    const userForToken = {
      email: user.email,
      id: user._id,
    }

    const token = jwt.sign(userForToken, config.SECRET, { expiresIn: 7200 })
    response.cookie('token', token, { httpOnly: true, sameSite: 'strict', secure: true })
    response.status(200).json(user)

  } catch (error) {
    console.error('Error during Google OAuth callback:', error)
    return next(createError('Error during Google OAuth callback', 500))
  }
}


module.exports = {
  signup,
  signin,
  google,
  googleOauth,
}