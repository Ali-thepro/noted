const signOut = async (request, response) => {
  response
    .clearCookie('token')
    .status(200)
    .send('User signed out successfully')
}

module.exports = {
  signOut,
}