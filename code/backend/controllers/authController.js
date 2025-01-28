const bcrypt = require('bcrypt')
const User = require('../models/user')
const createError = require('../utils/error')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')
const axios = require('axios')

const createAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    config.ACCESS_SECRET,
    { expiresIn: '15m' }
  )
}

const createRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    config.REFRESH_SECRET,
    { expiresIn: '7d' }
  )
}

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
  const mode = request.query.mode
  const redirect = request.query.redirect

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

  if ( mode && redirect && mode === 'cli') {
    const token = jwt.sign(userForToken, config.ACCESS_SECRET, { expiresIn: '30d' })
    return response.status(200).json({
      redirectUrl: `${redirect}?token=${token}`
    })
  } else {
    const accessToken = createAccessToken(user)
    const refreshToken = createRefreshToken(user)

    response
      .status(200)
      .cookie('accessToken', accessToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: true,
        maxAge: 15 * 60 * 1000
      })
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      .json(user)
  }
}

const refreshToken = async (request, response, next) => {
  const refreshToken = request.cookies.refreshToken

  if (!refreshToken) {
    return next(createError('Refresh token not provided', 401))
  }

  try {
    const decoded = jwt.verify(refreshToken, config.REFRESH_SECRET)
    const user = await User.findById(decoded.id)

    if (!user) {
      return next(createError('User not found', 404))
    }

    const newAccessToken = createAccessToken(user)

    response
      .cookie('accessToken', newAccessToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: true,
        maxAge: 15 * 60 * 1000,
      })
      .json(user)
  } catch (error) {
    console.error('Error during token refresh:', error)
    return next(createError('Invalid refresh token', 403))
  }
}


function getGoogleAuthURL(mode, redirect) {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
  const options = {
    redirect_uri: config.GOOGLE_REDIRECT_URI,
    client_id: config.GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    state: JSON.stringify({
      mode,
      redirect,
    }),
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  }

  const queryOptions = new URLSearchParams(options).toString()

  return `${rootUrl}?${queryOptions}`

}

const googleOauth = (request, response) => {
  const mode = request.query.mode
  const redirect = request.query.redirect

  const googleAuthURL = getGoogleAuthURL(mode, redirect)
  response.redirect(googleAuthURL)
}


const google = async (request, response, next) => {
  const code = request.query.code
  const stateParam = request.query.state

  let mode
  let redirect

  if (stateParam) {
    const state = JSON.parse(stateParam)
    mode = state.mode
    redirect = state.redirect
  }

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


    if (mode === 'cli') {
      const token = jwt.sign(userForToken, config.ACCESS_SECRET, { expiresIn: '10d' })
      response.redirect(`${redirect}?token=${token}`)
    } else {
      const accessToken = createAccessToken(user)
      const refreshToken = createRefreshToken(user)

      response
        .cookie('accessToken', accessToken, {
          httpOnly: true,
          sameSite: 'strict',
          secure: true,
          maxAge: 15 * 60 * 1000
        })
        .cookie('refreshToken', refreshToken, {
          httpOnly: true,
          sameSite: 'strict',
          secure: true,
          maxAge: 7 * 24 * 60 * 60 * 1000
        })
      response.redirect(`${config.UI_URI}/oauth/callback`)
    }

  } catch (error) {
    console.error('Error during Google OAuth callback:', error)
    return next(createError('Error during Google OAuth callback', 500))
  }
}


function getGitHubAuthURL(mode,redirect) {
  const rootUrl = 'https://github.com/login/oauth/authorize'
  const options = {
    client_id: config.GITHUB_CLIENT_ID,
    redirect_uri: config.GITHUB_REDIRECT_URI,
    scope: 'user:email',
    allow_signup: 'true',
    state: JSON.stringify({
      mode,
      redirect,
    }),
  }
  const queryOptions = new URLSearchParams(options).toString()

  return `${rootUrl}?${queryOptions}`
}

const githubOauth = (request, response) => {
  const mode = request.query.mode
  const redirect = request.query.redirect
  const githubAuthURL = getGitHubAuthURL(mode, redirect)
  response.redirect(githubAuthURL)
}

const github = async (request, response, next) => {
  const code = request.query.code
  const stateParam = request.query.state

  let mode
  let redirect

  if (stateParam) {
    const state = JSON.parse(stateParam)
    mode = state.mode
    redirect = state.redirect
  }

  try {
    const { data } = await axios({
      url: 'https://github.com/login/oauth/access_token',
      method: 'post',
      headers: {
        accept: 'application/json',
      },
      data: {
        client_id: config.GITHUB_CLIENT_ID,
        client_secret: config.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: config.GITHUB_REDIRECT_URI,
      },
    })

    const { access_token } = data

    const { data: userProfile } = await axios({
      url: 'https://api.github.com/user',
      method: 'get',
      headers: {
        Authorization: `token ${access_token}`,
      },
    })

    const { data: userEmail } = await axios({
      url: 'https://api.github.com/user/emails',
      method: 'get',
      headers: {
        Authorization: `token ${access_token}`,
      },
    })


    const primaryEmail = userEmail.find(email => email.primary).email

    const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(generatedPassword, saltRounds)
    let user = await User.findOne({ email: primaryEmail, provider: 'github' })
    if (!user) {
      user = await User.create({
        email: primaryEmail,
        username: userProfile.login,
        provider: 'github',
        passwordHash,
        oauth: true,
      })
    }
    const userForToken = {
      email: user.email,
      id: user._id,
    }


    if (mode === 'cli') {
      const token = jwt.sign(userForToken, config.ACCESS_SECRET, { expiresIn: '10d' })
      return response.redirect(`${redirect}?token=${token}`)
    } else {
      const accessToken = createAccessToken(user)
      const refreshToken = createRefreshToken(user)

      response
        .cookie('accessToken', accessToken, {
          httpOnly: true,
          sameSite: 'strict',
          secure: true,
          maxAge: 15 * 60 * 1000
        })
        .cookie('refreshToken', refreshToken, {
          httpOnly: true,
          sameSite: 'strict',
          secure: true,
          maxAge: 7 * 24 * 60 * 60 * 1000
        })
      response.redirect(`${config.UI_URI}/oauth/callback`)
    }

  } catch (error) {
    console.error('Error during GitHub OAuth callback:', error)
    return next(createError('Error during GitHub OAuth callback', 500))
  }
}

const signOut = async (request, response) => {
  response
    .clearCookie('accessToken')
    .clearCookie('refreshToken')
    .status(200)
    .send('User signed out successfully')
}

const me = async (request, response, next) => {
  try {
    const user = request.user
    if (!user) {
      return next(createError('Unauthorised', 401))
    }
    response.json(user)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  signup,
  signin,
  refreshToken,
  google,
  googleOauth,
  github,
  githubOauth,
  signOut,
  me
}
