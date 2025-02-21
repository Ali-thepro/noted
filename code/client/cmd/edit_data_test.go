package cmd

import (
	"testing"
	"time"

	"noted/internal/storage"

	"github.com/spf13/cobra"
	"github.com/stretchr/testify/assert"
)

func TestEditDataCmd(t *testing.T) {
	tmpDir := t.TempDir()
	t.Setenv("NOTED_CONFIG_DIR", tmpDir)

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
		{
			name: "with valid note ID and new title",
			args: []string{"test-id"},
			flags: map[string]string{
				"new-title": "New Test Note",
			},
			wantErr: true,
			errMsg:  "noted is locked",
		},
		{
			name: "with valid note ID and tags",
			args: []string{"test-id"},
			flags: map[string]string{
				"tags": "tag1,tag2",
			},
			wantErr: true,
			errMsg:  "noted is locked",
		},
		{
			name: "with valid note ID and replace tags",
			args: []string{"test-id"},
			flags: map[string]string{
				"tags":    "tag1,tag2",
				"replace": "true",
			},
			wantErr: true,
			errMsg:  "noted is locked",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			cmd := &cobra.Command{}
			cmd.Flags().StringP("title", "t", "", "Title of the note")
			cmd.Flags().StringP("new-title", "n", "", "New title for the note")
			cmd.Flags().StringSlice("tags", []string{}, "Tags to add/replace")
			cmd.Flags().BoolP("replace", "r", false, "Replace existing tags")

			for k, v := range tt.flags {
				cmd.Flags().Set(k, v) //nolint:errcheck // Ignoring error check in test
			}

			err := editDataCmd.RunE(cmd, tt.args)
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

func TestEditDataCmdFlags(t *testing.T) {
	assert.NotNil(t, editDataCmd.Flags().Lookup("title"))
	assert.NotNil(t, editDataCmd.Flags().Lookup("new-title"))
	assert.NotNil(t, editDataCmd.Flags().Lookup("tags"))
	assert.NotNil(t, editDataCmd.Flags().Lookup("replace"))
}
