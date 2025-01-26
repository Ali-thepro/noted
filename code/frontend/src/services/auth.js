import axiosInstance from './axiosConfig'
const BASE_URL = '/api/auth'

export const signup = async (credentials, mode, redirect) => {
  let url = `${BASE_URL}/signup`
  if (mode && redirect) {
    url += `?mode=${mode}&redirect=${redirect}`
  }
  const response = await axiosInstance.post(url, credentials)
  return response.data
}

export const signin = async (credentials, mode, redirect) => {
  let url = `${BASE_URL}/signin`
  if (mode && redirect) {
    url += `?mode=${mode}&redirect=${redirect}`
  }

  const response = await axiosInstance.post(url, credentials)
  return response.data
}

export const refreshUserToken = async () => {
  const response = await axiosInstance.post(`${BASE_URL}/refresh-token`)
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
  const response = await axiosInstance.post(`${BASE_URL}/signout`)
  return response.data
}

export const me = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/me`)
  return response.data
}
