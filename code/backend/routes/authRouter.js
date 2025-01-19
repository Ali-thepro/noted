const authRouter = require('express').Router()
const { signup, signin, google, googleOauth, github, githubOauth, signOut, me } = require('../controllers/authController')
const middleware = require('../utils/middleware')

authRouter.post('/signup', signup)
authRouter.post('/signin', signin)
authRouter.get('/google', googleOauth)
authRouter.get('/google/callback', google)
authRouter.get('/github', githubOauth)
authRouter.get('/github/callback', github)
authRouter.post('/signout', middleware.verifyUser, signOut)
authRouter.get('/me', middleware.verifyUser, me)

module.exports = authRouter
