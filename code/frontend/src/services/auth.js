import axios from 'axios'
const BASE_URL = '/api/auth'

export const signup = async (credentials) => {
  const response = await axios.post(`${BASE_URL}/signup`, credentials)
  return response
}

export const signin = async (credentials, mode, redirect) => {
  console.log(mode, redirect)
  let url = `${BASE_URL}/signin`
  if (mode && redirect) {
    url += `?mode=${mode}&redirect=${redirect}`
  }

  const response = await axios.post(url, credentials)
  return response.data
}

export const googleAuth = () => {
  window.location.href = `${BASE_URL}/google`
}

export const githubAuth = () => {
  window.location.href = `${BASE_URL}/github`
}

export const me = async () => {
  const response = await axios.get(`${BASE_URL}/me`)
  return response.data
}