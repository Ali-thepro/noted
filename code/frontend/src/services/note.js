import axiosInstance from './axiosConfig'
const BASE_URL = '/api/note'

export const getNotes = async (query = '') => {
  const response = await axiosInstance.get(`${BASE_URL}/get?${query}`)
  return response.data
}

export const getNote = async (id) => {
  const response = await axiosInstance.get(`${BASE_URL}/get/${id}`)
  return response.data
}

export const createNote = async (noteData) => {
  const response = await axiosInstance.post(`${BASE_URL}/create`, noteData)
  return response.data
}

export const updateNote = async (id, noteData) => {
  const response = await axiosInstance.put(`${BASE_URL}/update/${id}`, noteData)
  return response.data
}

export const deleteNote = async (id) => {
  await axiosInstance.delete(`${BASE_URL}/delete/${id}`)
}
