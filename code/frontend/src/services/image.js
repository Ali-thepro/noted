import axiosInstance from './axiosConfig'
const BASE_URL = '/api/image'

const uploadImage = async (file) => {
  const formData = new FormData()
  formData.append('image', file)

  const response = await axiosInstance.post(`${BASE_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  return response.data
}

export default { uploadImage }
