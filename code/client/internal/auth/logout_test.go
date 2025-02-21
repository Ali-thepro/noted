package auth

import (
	"testing"

	"noted/internal/token"

	"github.com/stretchr/testify/assert"
)

func TestHandleLogout(t *testing.T) {
	tmpDir := t.TempDir()
	t.Setenv("NOTED_CONFIG_DIR", tmpDir)

	// Test case: Successful logout
	err := token.Save("test-token")
	assert.NoError(t, err)

	err = HandleLogout()
	assert.NoError(t, err)

	_, err = token.Load()
	assert.Error(t, err)
}
