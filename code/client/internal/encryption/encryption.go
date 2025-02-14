package encryption

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"fmt"
	"golang.org/x/crypto/argon2"
	"golang.org/x/crypto/hkdf"
	"io"
	"strings"
)

type params struct {
	memory      uint32
	iterations  uint32
	parallelism uint8
	keyLength   uint32
}

type EncryptionService struct{}

func NewEncryptionService() *EncryptionService {
	return &EncryptionService{}
}

func (e *EncryptionService) Hash(value string) ([]byte, error) {
	salt := []byte(strings.ToLower(value))
	saltHash := sha256.Sum256(salt)
	return saltHash[:], nil
}

func (e *EncryptionService) GenerateMasterKey(masterPassword string, emailHash []byte) ([]byte, error) {
	p := &params{
		memory:      64 * 1024,
		iterations:  4,
		parallelism: 3,
		keyLength:   32,
	}
	masterKey := argon2.IDKey([]byte(masterPassword), emailHash, p.iterations, p.memory, p.parallelism, p.keyLength)
	return masterKey, nil
}

func (e *EncryptionService) GenerateMasterPasswordHash(keyHash, masterPasswordHash []byte) (string, error) {
	p := &params{
		memory:      64 * 1024,
		iterations:  4,
		parallelism: 3,
		keyLength:   32,
	}
	masterKeyHash := argon2.IDKey(keyHash, masterPasswordHash, p.iterations, p.memory, p.parallelism, p.keyLength)
	b64Salt := base64.RawStdEncoding.EncodeToString(masterPasswordHash)
	b64Hash := base64.RawStdEncoding.EncodeToString(masterKeyHash)

	encodedHash := fmt.Sprintf("$argon2id$v=%d$m=%d,t=%d,p=%d$%s$%s", argon2.Version, p.memory, p.iterations, p.parallelism, b64Salt, b64Hash)
	return encodedHash, nil
}

func (e *EncryptionService) SecureCompare(password, encodedHash string) (bool, error) {
	p, salt, hash, err := decodeHash(encodedHash)
	if err != nil {
		return false, err
	}

	otherHash := argon2.IDKey([]byte(password), salt, p.iterations, p.memory, p.parallelism, p.keyLength)

	if subtle.ConstantTimeCompare(hash, otherHash) == 1 {
		return true, nil
	}
	return false, nil
}

func decodeHash(encodedHash string) (p *params, salt, hash []byte, err error) {
	vals := strings.Split(encodedHash, "$")
	if len(vals) != 6 {
		return nil, nil, nil, fmt.Errorf("invalid hash")
	}

	var version int
	_, err = fmt.Sscanf(vals[2], "v=%d", &version)
	if err != nil {
		return nil, nil, nil, err
	}
	if version != argon2.Version {
		return nil, nil, nil, fmt.Errorf("incompatible version")
	}

	p = &params{}
	_, err = fmt.Sscanf(vals[3], "m=%d,t=%d,p=%d", &p.memory, &p.iterations, &p.parallelism)
	if err != nil {
		return nil, nil, nil, err
	}

	salt, err = base64.RawStdEncoding.Strict().DecodeString(vals[4])
	if err != nil {
		return nil, nil, nil, err
	}

	hash, err = base64.RawStdEncoding.Strict().DecodeString(vals[5])
	if err != nil {
		return nil, nil, nil, err
	}
	p.keyLength = uint32(len(hash))

	return p, salt, hash, nil
}

func (e *EncryptionService) HKDF(masterKey []byte, emailHash []byte) ([]byte, error) {
	info := []byte("encryption")
	hkdfReader := hkdf.New(sha256.New, masterKey, emailHash, info)
	hkdfKey := make([]byte, 32)
	if _, err := io.ReadFull(hkdfReader, hkdfKey); err != nil {
		return nil, err
	}
	return hkdfKey, nil
}

func (e *EncryptionService) GenerateKey(size int) ([]byte, error) {
	key := make([]byte, size)
	_, err := rand.Read(key)
	if err != nil {
		return nil, err
	}
	return key, nil
}

func (e *EncryptionService) EncryptAESGCM(plaintext, key []byte) (string, string, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", "", err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", "", err
	}
	iv := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
		return "", "", err
	}
	ciphertext := gcm.Seal(nil, iv, plaintext, nil)
	return base64.StdEncoding.EncodeToString(ciphertext), base64.StdEncoding.EncodeToString(iv), nil
}

func (e *EncryptionService) DecryptAESGCM(ciphertextB64, ivB64 string, key []byte) ([]byte, error) {
	ciphertext, err := base64.StdEncoding.DecodeString(ciphertextB64)
	if err != nil {
		return nil, err
	}
	iv, err := base64.StdEncoding.DecodeString(ivB64)
	if err != nil {
		return nil, err
	}
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}
	plaintext, err := gcm.Open(nil, iv, ciphertext, nil)
	if err != nil {
		return nil, err
	}
	return plaintext, nil
}

func (e *EncryptionService) EncryptSymmetricKey(symmetricKey, stretchedKey []byte) (string, string, error) {
	return e.EncryptAESGCM(symmetricKey, stretchedKey)
}

func (e *EncryptionService) DecryptSymmetricKey(encryptedKeyB64, ivB64 string, stretchedKey []byte) ([]byte, error) {
	return e.DecryptAESGCM(encryptedKeyB64, ivB64, stretchedKey)
}

func (e *EncryptionService) EncryptNoteContent(content string, noteCipherKey []byte) (string, string, error) {
	return e.EncryptAESGCM([]byte(content), noteCipherKey)
}

func (e *EncryptionService) DecryptNoteContent(encryptedContentB64, ivB64 string, noteCipherKey []byte) (string, error) {
	plaintext, err := e.DecryptAESGCM(encryptedContentB64, ivB64, noteCipherKey)
	if err != nil {
		return "", err
	}
	return string(plaintext), nil
}

func (e *EncryptionService) WrapNoteCipherKey(noteCipherKey, symmetricKey []byte) (string, string, error) {
	return e.EncryptAESGCM(noteCipherKey, symmetricKey)
}

func (e *EncryptionService) UnwrapNoteCipherKey(protectedKeyB64, ivB64 string, symmetricKey []byte) ([]byte, error) {
	return e.DecryptAESGCM(protectedKeyB64, ivB64, symmetricKey)
}
