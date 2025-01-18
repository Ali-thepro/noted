import axios from 'axios'
const BASE_URL = '/api/user'

export const signOutUserFromDB = async () => {
  const response = await axios.post(`${BASE_URL}/signout`)
  return response.data
}
