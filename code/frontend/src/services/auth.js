import axios from 'axios'
const BASE_URL = '/api/auth'

export const signup = async (credentials) => {
    const response = await axios.post(`${BASE_URL}/signup`, credentials)
    return response.data
}