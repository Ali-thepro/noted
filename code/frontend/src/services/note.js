import axios from 'axios'
const BASE_URL = '/api/notes'

export const getNotes = async (query = '') => {
  const response = await axios.get(`${BASE_URL}/get${query}`)
  return response.data
}

export const getNote = async (id) => {
  const response = await axios.get(`${BASE_URL}/get/${id}`)
  return response.data
}

export const createNote = async (noteData) => {
  const response = await axios.post(`${BASE_URL}/create`, noteData)
  return response.data
}

export const updateNote = async (id, noteData) => {
  const response = await axios.put(`${BASE_URL}/update/${id}`, noteData)
  return response.data
}

export const deleteNote = async (id) => {
  await axios.delete(`${BASE_URL}/delete/${id}`)
}
