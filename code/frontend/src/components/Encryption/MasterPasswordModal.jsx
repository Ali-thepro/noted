import { useState, useEffect } from 'react'
import { Modal, Button, Label, TextInput, Progress } from 'flowbite-react'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import zxcvbn from 'zxcvbn'
import { EncryptionService } from '../../utils/encryption'
import { setNotification } from '../../redux/reducers/notificationReducer'
import { setup } from '../../services/encryption'
import { useNavigate } from 'react-router-dom'
import Notification from '../Notification'
import memoryStore from '../../utils/memoryStore'

const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']
const strengthColors = ['red', 'red', 'yellow', 'lime', 'green']

const MasterPasswordModal = ({ show, onClose, email }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const theme = useSelector(state => state.theme)
  const [masterPassword, setMasterPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [loading, setLoading] = useState(false)
  const encryptionService = new EncryptionService()

  useEffect(() => {
    if (masterPassword) {
      const result = zxcvbn(masterPassword)
      setPasswordStrength(result.score)
    } else {
      setPasswordStrength(0)
    }
  }, [masterPassword])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    if (masterPassword !== confirmPassword) {
      dispatch(setNotification('Passwords do not match', 'failure'))
      return
    }

    if (passwordStrength < 2) {
      dispatch(setNotification('Please choose a stronger password', 'failure'))
      return
    }

    try {
      const emailHash = await encryptionService.hash(email)
      const passwordHash = await encryptionService.hash(masterPassword)
      const masterKey = await encryptionService.generateMasterKey(masterPassword, emailHash)
      const { encoded: masterPasswordHash } = await encryptionService.generateMasterPasswordHash(masterKey, passwordHash)
      const stretchedKey = await encryptionService.hkdf(masterKey, emailHash)
      const symmetricKey = await encryptionService.generateKey()
      const { encryptedKey, iv } = await encryptionService.encryptSymmetricKey(symmetricKey, stretchedKey)
      memoryStore.set(symmetricKey)
      await setup({
        masterPasswordHash,
        protectedSymmetricKey: encryptedKey,
        iv
      })
      dispatch(setNotification('Master password set successfully', 'success'))
      setMasterPassword('')
      setConfirmPassword('')
      onClose()
      navigate('/')
    } catch (error) {
      console.error('Error setting up master password:', error)
      dispatch(setNotification('Failed to set master password', 'failure'))
      setMasterPassword('')
      setConfirmPassword('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal show={show} onClose={onClose} className={theme === 'dark' ? 'dark' : ''}>
      <Modal.Header>Set Master Password</Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <Notification />
          <div className="space-y-4">
            <div>
              <Label htmlFor="masterPassword">Master Password</Label>
              <TextInput
                id="masterPassword"
                type="password"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                required
              />
              {masterPassword && (
                <div className="mt-2">
                  <Progress
                    progress={((passwordStrength + 1) / 5) * 100}
                    color={strengthColors[passwordStrength]}
                    size="sm"
                  />
                  <p className="text-sm mt-1 text-gray-300">
                    Strength: {strengthLabels[passwordStrength]}
                  </p>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <TextInput
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button type="submit" disabled={loading} className="focus:ring-0">
            {loading ? 'Setting up...' : 'Set Password'}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

MasterPasswordModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  email: PropTypes.string.isRequired
}

export default MasterPasswordModal
