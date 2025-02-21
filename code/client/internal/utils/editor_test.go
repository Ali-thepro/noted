package utils

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetDefaultEditor(t *testing.T) {
	// Save original env
	originalEditor := os.Getenv("EDITOR")
	originalVisual := os.Getenv("VISUAL")
	defer func() {
		os.Setenv("EDITOR", originalEditor)
		os.Setenv("VISUAL", originalVisual)
	}()

	// Test EDITOR environment variable
	os.Setenv("EDITOR", "test-editor")
	os.Setenv("VISUAL", "")
	assert.Equal(t, "test-editor", GetDefaultEditor())

	// Test VISUAL environment variable
	os.Setenv("EDITOR", "")
	os.Setenv("VISUAL", "test-visual")
	assert.Equal(t, "test-visual", GetDefaultEditor())

	// Test fallback
	os.Setenv("EDITOR", "")
	os.Setenv("VISUAL", "")
	editor := GetDefaultEditor()
	assert.Contains(t, []string{"nano", "vim", "vi", "notepad"}, editor)
}

func TestOpenInEditor(t *testing.T) {
	// Create a temporary file
	tmpFile, err := os.CreateTemp("", "editor-test-*.txt")
	assert.NoError(t, err)
	defer os.Remove(tmpFile.Name())

	// Set a known editor
	originalEditor := os.Getenv("EDITOR")
	defer os.Setenv("EDITOR", originalEditor)
	os.Setenv("EDITOR", "echo") // 'echo' command exists on all platforms

	err = OpenInEditor(tmpFile.Name())
	assert.NoError(t, err)
}
