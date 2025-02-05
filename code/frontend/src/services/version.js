import axiosInstance from './axiosConfig'
const BASE_URL = '/api/version'

export const createVersion = async (noteId, versionData) => {
  const response = await axiosInstance.post(`${BASE_URL}/${noteId}`, versionData)
  return response.data
}

export const getVersions = async (noteId) => {
  const response = await axiosInstance.get(`${BASE_URL}/${noteId}`)
  return response.data
}

export const getVersionChain = async (noteId, until) => {
  const url = until
    ? `${BASE_URL}/${noteId}/chain?until=${until}`
    : `${BASE_URL}/${noteId}/chain`
  const response = await axiosInstance.get(url)
  return response.data
}
