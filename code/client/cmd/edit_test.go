package cmd

import (
	"testing"
	"time"

	"noted/internal/storage"

	"github.com/spf13/cobra"
	"github.com/stretchr/testify/assert"
)

func TestEditCmd(t *testing.T) {
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

	index := &storage.Index{Notes: []storage.Note{*mockNote}}
	err := storage.SaveIndex(index)
	assert.NoError(t, err)

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
			name:    "no args and no title flag",
			args:    []string{},
			wantErr: true,
			errMsg:  "either provide a note ID as an argument or use --title flag",
		},
		{
			name:    "with invalid note ID",
			args:    []string{"invalid-id"},
			wantErr: true,
			errMsg:  "no note found with ID: invalid-id",
		},
		{
			name: "with empty title",
			args: []string{},
			flags: map[string]string{
				"title": "",
			},
			wantErr: true,
			errMsg:  "either provide a note ID as an argument or use --title flag",
		},
		{
			name: "with non-existent title",
			args: []string{},
			flags: map[string]string{
				"title": "Non Existent Note",
			},
			wantErr: true,
			errMsg:  "no note found with title: Non Existent Note",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			cmd := &cobra.Command{}
			cmd.Flags().StringP("title", "t", "", "Title of the note")
			for k, v := range tt.flags {
				cmd.Flags().Set(k, v) //nolint:errcheck // Ignoring error check in test
			}

			err := editCmd.RunE(cmd, tt.args)
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

func TestEditCmdFlags(t *testing.T) {
	assert.NotNil(t, editCmd.Flags().Lookup("title"))
}
