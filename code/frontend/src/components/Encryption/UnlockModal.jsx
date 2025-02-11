import { useState } from 'react'
import { Modal, Button, Label, TextInput } from 'flowbite-react'
import memoryStore from '../../utils/memoryStore'
import { EncryptionService } from '../../utils/encryption'
import { useDispatch, useSelector } from 'react-redux'
import { setNotification } from '../../redux/reducers/notificationReducer'
import { getMasterPasswordHash, getProtectedSymmetricKey, getIv } from '../../services/encryption'
import Notification from '../Notification'
import { signOutUser } from '../../redux/reducers/authReducer'
import PropTypes from 'prop-types'

const UnlockModal = ({ show, onClose, email }) => {
  const [masterPassword, setMasterPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const encryptionService = new EncryptionService()
  const theme = useSelector(state => state.theme)

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)

      const masterPasswordHash = await getMasterPasswordHash()
      const protectedSymmetricKey = await getProtectedSymmetricKey()
      const iv = await getIv()

      const emailHash = await encryptionService.hash(email)
      const passwordHash = await encryptionService.hash(masterPassword)
      const masterKey = await encryptionService.generateMasterKey(masterPassword, emailHash)
      const { encoded } = await encryptionService.generateMasterPasswordHash(masterKey, passwordHash)
      const isCorrect = await encryptionService.secureCompare(encoded, masterPasswordHash)
      if (!isCorrect) {
        throw new Error('Incorrect master password')
      }
      const stretchedKey = await encryptionService.hkdf(masterKey, emailHash)
      const symmetricKey = await encryptionService.decryptSymmetricKey(
        protectedSymmetricKey,
        iv,
        stretchedKey
      )
      memoryStore.set(symmetricKey)
      dispatch(setNotification('Vault unlocked successfully', 'success'))
      onClose()
    } catch (error) {
      console.error('Error unlocking vault:', error)
      dispatch(setNotification('Incorrect master password', 'failure'))
    } finally {
      setLoading(false)
      setMasterPassword('')
    }
  }

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)',
    zIndex: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }

  return (
    <>
      {show && (
        <div style={overlayStyle}>
          <Modal
            show={true}
            className={theme === 'dark' ? 'dark' : ''}
            popup
            size="md"
          >
            <Modal.Header className="border-b border-gray-200 dark:border-gray-700">
              Unlock Noted
            </Modal.Header>
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
                      className="mt-1"
                      autoFocus
                    />
                  </div>
                </div>
              </Modal.Body>
              <Modal.Footer className="border-t border-gray-200 dark:border-gray-700">
                <Button type="submit" disabled={loading} className="focus:ring-0">
                  {loading ? 'Unlocking...' : 'Unlock'}
                </Button>
                <Button onClick={() => dispatch(signOutUser())} color="failure" className="focus:ring-0">
                  Sign Out
                </Button>
              </Modal.Footer>
            </form>
          </Modal>
        </div>
      )}
    </>
  )
}

UnlockModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  email: PropTypes.string.isRequired
}

export default UnlockModal
