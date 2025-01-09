import axios from 'axios'
const BASE_URL = '/api/auth'

export const signup = async (credentials) => {
  const response = await axios.post(`${BASE_URL}/signup`, credentials)
  return response
}
export const signin = async (credentials) => {
  const response = await axios.post(`${BASE_URL}/signin`, credentials)
  return response.data
}


export const googleAuth = () => {
  window.location.href = '/api/auth/google'
}

export const githubAuth = () => {
  window.location.href = '/api/auth/github'
}