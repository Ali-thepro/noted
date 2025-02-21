package cmd

import (
	"testing"
	"time"

	"noted/internal/storage"

	"github.com/spf13/cobra"
	"github.com/stretchr/testify/assert"
)

func TestPushCmd(t *testing.T) {
	// Create temp test directory
	tmpDir := t.TempDir()
	t.Setenv("NOTED_CONFIG_DIR", tmpDir)

	// Setup test data
	mockNote := &storage.Note{
		ID:        "test-id",
		Title:     "Test Note",
		Filename:  "test-note.md",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		Tags:      []string{"test"},
	}

	// Save mock note to index
	index := &storage.Index{Notes: []storage.Note{*mockNote}}
	err := storage.SaveIndex(index)
	assert.NoError(t, err)

	// Create test file content
	err = storage.WriteNoteContent(mockNote.Filename, "test content")
	assert.NoError(t, err)

	tests := []struct {
		name    string
		args    []string
		flags   map[string]string
		wantErr bool
		errMsg  string
	}{
		{
			name:    "with valid note ID",
			args:    []string{"test-id"},
			wantErr: true,
			errMsg:  "noted is locked",
		},
		{
			name: "with title flag",
			args: []string{},
			flags: map[string]string{
				"title": "Test Note",
			},
			wantErr: true,
			errMsg:  "noted is locked",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			cmd := &cobra.Command{}
			cmd.Flags().StringP("title", "t", "", "Title of the note")
			for k, v := range tt.flags {
				cmd.Flags().Set(k, v)
			}

			err := pushCmd.RunE(cmd, tt.args)
			if tt.wantErr {
				assert.Error(t, err)
				if tt.errMsg != "" {
					assert.Contains(t, err.Error(), tt.errMsg)
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestPushCmdFlags(t *testing.T) {
	assert.NotNil(t, pushCmd.Flags().Lookup("title"))
}
