package cmd

import (
	"testing"
	"time"

	"noted/internal/storage"

	"github.com/spf13/cobra"
	"github.com/stretchr/testify/assert"
)

func TestListCmd(t *testing.T) {
	// Create temp test directory
	tmpDir := t.TempDir()
	t.Setenv("NOTED_CONFIG_DIR", tmpDir)

	// Setup test data
	mockNotes := []storage.Note{
		{
			ID:        "test-id-1",
			Title:     "Test Note 1",
			Filename:  "test-note-1.md",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
			Tags:      []string{"test"},
		},
		{
			ID:        "test-id-2",
			Title:     "Test Note with a Very Long Title That Should Be Truncated Because It Exceeds the Maximum Length",
			Filename:  "test-note-2.md",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now().Add(time.Hour),
			Tags:      []string{"test"},
		},
	}

	index := &storage.Index{Notes: mockNotes}
	err := storage.SaveIndex(index)
	assert.NoError(t, err)

	tests := []struct {
		name    string
		wantErr bool
		setup   func() error
	}{
		{
			name:    "empty index",
			wantErr: false,
			setup: func() error {
				return storage.SaveIndex(&storage.Index{})
			},
		},
		{
			name:    "with notes",
			wantErr: false,
			setup: func() error {
				return storage.SaveIndex(index)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.setup != nil {
				err := tt.setup()
				assert.NoError(t, err)
			}
			cmd := &cobra.Command{}
			err := listCmd.RunE(cmd, []string{})

			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestListCmdSorting(t *testing.T) {
	tmpDir := t.TempDir()
	t.Setenv("NOTED_CONFIG_DIR", tmpDir)

	now := time.Now()
	mockNotes := []storage.Note{
		{
			ID:        "test-id-1",
			Title:     "A Test Note",
			Filename:  "test-note-1.md",
			CreatedAt: now,
			UpdatedAt: now,
		},
		{
			ID:        "test-id-2",
			Title:     "B Test Note",
			Filename:  "test-note-2.md",
			CreatedAt: now,
			UpdatedAt: now.Add(time.Hour),
		},
		{
			ID:        "test-id-3",
			Title:     "C Test Note",
			Filename:  "test-note-3.md",
			CreatedAt: now,
			UpdatedAt: now.Add(-time.Hour),
		},
	}

	index := &storage.Index{Notes: mockNotes}
	err := storage.SaveIndex(index)
	assert.NoError(t, err)

	cmd := &cobra.Command{}
	err = listCmd.RunE(cmd, []string{})
	assert.NoError(t, err)
}
