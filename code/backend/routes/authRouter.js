const authRouter = require('express').Router()
const { signup, signin, google, googleOauth, github, githubOauth } = require('../controllers/authController')

authRouter.post('/signup', signup)
authRouter.post('/signin', signin)
authRouter.get('/google', googleOauth)
authRouter.get('/google/callback', google)
authRouter.get('/github', githubOauth)
authRouter.get('/github/callback', github)

module.exports = authRouter