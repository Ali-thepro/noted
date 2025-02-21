package utils

import (
	"testing"

	"noted/internal/api"
	"noted/internal/encryption"

	"github.com/stretchr/testify/assert"
)

func TestBuildDecryptedVersionContent(t *testing.T) {
	encryptionService := encryption.NewEncryptionService()
	symmetricKey := make([]byte, 32)

	chain := []*api.Version{
		{
			Type:      "full",
			Content:   "test content",
			ContentIv: "test iv",
			CipherKey: "test key",
			CipherIv:  "test iv",
			Metadata: api.VersionMetadata{
				VersionNumber: 1,
			},
		},
	}

	_, err := BuildDecryptedVersionContent(chain, encryptionService, symmetricKey)
	assert.Error(t, err) // Expected error due to invalid encryption data
}

func TestBuildDecryptedVersionContentEmpty(t *testing.T) {
	encryptionService := encryption.NewEncryptionService()
	symmetricKey := make([]byte, 32)

	chain := []*api.Version{}

	_, err := BuildDecryptedVersionContent(chain, encryptionService, symmetricKey)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "empty version chain")
}
