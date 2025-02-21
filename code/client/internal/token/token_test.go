package token

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
)

func setupTestDir(t *testing.T) string {
	tmpDir, err := os.MkdirTemp("", "token-test")
	assert.NoError(t, err)
	os.Setenv("NOTED_CONFIG_DIR", tmpDir)
	return tmpDir
}

func TestSaveAndLoad(t *testing.T) {
	tmpDir := setupTestDir(t)
	defer os.RemoveAll(tmpDir)

	// Test saving token
	testToken := "test-token-123"
	err := Save(testToken)
	assert.NoError(t, err)

	// Test loading token
	loadedToken, err := Load()
	assert.NoError(t, err)
	assert.Equal(t, testToken, loadedToken)
}

func TestGetConfigDir(t *testing.T) {
	tmpDir := setupTestDir(t)
	defer os.RemoveAll(tmpDir)

	configDir, err := GetConfigDir()
	assert.NoError(t, err)
	assert.NotEmpty(t, configDir)

	// Verify directory was created
	_, err = os.Stat(configDir)
	assert.NoError(t, err)
}

func TestRemove(t *testing.T) {
	tmpDir := setupTestDir(t)
	defer os.RemoveAll(tmpDir)

	// Save a token first
	testToken := "test-token-123"
	err := Save(testToken)
	assert.NoError(t, err)

	// Test removing token
	err = Remove()
	assert.NoError(t, err)

	// Verify token file is gone
	_, err = os.Stat(filepath.Join(tmpDir, "token.json"))
	assert.True(t, os.IsNotExist(err))
}
