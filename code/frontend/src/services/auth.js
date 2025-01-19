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

export const googleAuth = (mode, redirect) => {
  let url = `${BASE_URL}/google`
  if (mode && redirect) {
    url += `?mode=${mode}&redirect=${redirect}`
  }
  window.location.href = url
}

export const githubAuth = (mode, redirect) => {
  let url = `${BASE_URL}/github`
  if (mode && redirect) {
    url += `?mode=${mode}&redirect=${redirect}`
  }
  window.location.href = url
}

export const signOutUserFromDB = async () => {
  const response = await axios.post(`${BASE_URL}/signout`)
  return response.data
}

export const me = async () => {
  const response = await axios.get(`${BASE_URL}/me`)
  return response.data
}
