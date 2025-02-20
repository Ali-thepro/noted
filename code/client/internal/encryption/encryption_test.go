package encryption

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewEncryptionService(t *testing.T) {
	service := NewEncryptionService()
	assert.NotNil(t, service)
}

func TestHash(t *testing.T) {
	service := NewEncryptionService()
	hash, err := service.Hash("test@example.com")
	assert.NoError(t, err)
	assert.NotNil(t, hash)
	assert.Equal(t, 32, len(hash))
}

func TestEncryptionFlow(t *testing.T) {
	service := NewEncryptionService()

	// Test master key generation
	emailHash, err := service.Hash("test@example.com")
	assert.NoError(t, err)

	masterKey, err := service.GenerateMasterKey("password123", emailHash)
	assert.NoError(t, err)
	assert.NotNil(t, masterKey)

	// Test HKDF
	stretchedKey, err := service.HKDF(masterKey, emailHash)
	assert.NoError(t, err)
	assert.NotNil(t, stretchedKey)

	// Test symmetric key encryption
	symmetricKey, err := service.GenerateKey(32)
	assert.NoError(t, err)

	encryptedKey, keyIv, err := service.EncryptSymmetricKey(symmetricKey, stretchedKey)
	assert.NoError(t, err)
	assert.NotEmpty(t, encryptedKey)
	assert.NotEmpty(t, keyIv)

	// Test symmetric key decryption
	decryptedKey, err := service.DecryptSymmetricKey(encryptedKey, keyIv, stretchedKey)
	assert.NoError(t, err)
	assert.Equal(t, symmetricKey, decryptedKey)

	// Test content encryption
	content := "Hello, World!"
	encryptedContent, err := service.EncryptNote(content, symmetricKey)
	assert.NoError(t, err)
	assert.NotNil(t, encryptedContent)

	// Test content decryption
	decryptedContent, err := service.DecryptVersionContent(*encryptedContent, symmetricKey)
	assert.NoError(t, err)
	assert.Equal(t, content, decryptedContent)
}

func TestSecureCompare(t *testing.T) {
	service := NewEncryptionService()
	emailHash, _ := service.Hash("test@example.com")
	masterKey, _ := service.GenerateMasterKey("password123", emailHash)
	masterPasswordHash, _ := service.Hash("password123")

	hash1, err := service.GenerateMasterPasswordHash(masterKey, masterPasswordHash)
	assert.NoError(t, err)

	hash2, err := service.GenerateMasterPasswordHash(masterKey, masterPasswordHash)
	assert.NoError(t, err)

	result, err := service.SecureCompare(hash1, hash2)
	assert.NoError(t, err)
	assert.True(t, result)
}

func TestCreateEncryptedDiff(t *testing.T) {
	service := NewEncryptionService()
	symmetricKey, _ := service.GenerateKey(32)

	// Create proper encrypted note keys
	noteCipherKey, _ := service.GenerateKey(32)
	cipherKey, cipherIv, _ := service.WrapNoteCipherKey(noteCipherKey, symmetricKey)

	noteKeys := NoteKeys{
		CipherKey: cipherKey,
		CipherIv:  cipherIv,
	}

	baseContent := "Hello"
	newContent := "Hello, World!"

	diff, err := service.CreateEncryptedDiff(baseContent, newContent, noteKeys, symmetricKey)
	assert.NoError(t, err)
	assert.NotNil(t, diff)
}
