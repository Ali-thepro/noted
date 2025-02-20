package storage

import (
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func setupTestDir(t *testing.T) string {
	tmpDir, err := os.MkdirTemp("", "storage-test")
	assert.NoError(t, err)
	os.Setenv("NOTED_CONFIG_DIR", tmpDir)
	return tmpDir
}

func TestFindNotes(t *testing.T) {
	tmpDir := setupTestDir(t)
	defer os.RemoveAll(tmpDir)

	// Setup test data
	index := &Index{
		Notes: []Note{
			{
				ID:        "1",
				Title:     "Test Note",
				Filename:  "1-test-note.md",
				Tags:      []string{"test"},
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
		},
	}

	err := SaveIndex(index)
	assert.NoError(t, err)

	// Test finding notes
	notes, err := FindNotes("Test Note")
	assert.NoError(t, err)
	assert.Len(t, notes, 1)
	assert.Equal(t, "Test Note", notes[0].Title)
}
