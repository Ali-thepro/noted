import axios from 'axios'

const baseUrl = '/api/encryption'

export const setup = async (data) => {
  const response = await axios.post(`${baseUrl}/setup`, data)
  return response.data
}

export const getMasterPasswordHash = async () => {
  const response = await axios.get(`${baseUrl}/password`)
  return response.data
}

export const getProtectedSymmetricKey = async () => {
  const response = await axios.get(`${baseUrl}/symmetric-key`)
  return response.data
}

export const getIv = async () => {
  const response = await axios.get(`${baseUrl}/iv`)
  return response.data
}

export const encryptionStatus = async () => {
  const response = await axios.get(`${baseUrl}/status`)
  return response.data
}
