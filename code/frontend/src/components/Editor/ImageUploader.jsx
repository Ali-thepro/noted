import { useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Button, Modal, Spinner } from 'flowbite-react'
import PropTypes from 'prop-types'
import imageService from '../../services/image'

const ImageUploader = ({ onUpload, onClose }) => {
  const theme = useSelector(state => state.theme)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const validateImage = (file) => {
    if (!file) {
      return 'Please select an image'
    }

    if (!file.type.startsWith('image/')) {
      return 'File must be an image'
    }

    const MAX_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_SIZE) {
      return 'Image size must be less than 10MB'
    }

    return null
  }

  const handleFileSelect = async (event) => {
    setError(null)
    const file = event.target.files[0]
    const validationError = validateImage(file)

    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)

    try {
      const response = await imageService.uploadImage(file)
      onUpload(response)
    } catch (err) {
      const message = err.response?.data?.error || err.message
      setError(message)
      console.error('Upload error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleButtonClick = () => {
    setError(null)
    fileInputRef.current?.click()
  }

  return (
    <Modal show={true} onClose={onClose} className={theme === 'dark' ? 'dark' : ''}>
      <Modal.Header>Upload Image</Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Spinner size="lg" />
              <span className="ml-2">Uploading your image...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />
              <Button
                color="gray"
                onClick={handleButtonClick}
                className="focus:ring-0"
              >
                {isLoading ? 'Uploading...' : 'Select Image'}
              </Button>
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  )
}

ImageUploader.propTypes = {
  onUpload: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}

export default ImageUploader
