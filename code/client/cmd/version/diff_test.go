package version

import (
	"testing"
	"time"

	"noted/internal/storage"

	"github.com/spf13/cobra"
	"github.com/stretchr/testify/assert"
)

func TestDiffCmd(t *testing.T) {
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

	index := &storage.Index{Notes: []storage.Note{*mockNote}}
	err := storage.SaveIndex(index)
	assert.NoError(t, err)

	//sample data to test
	err = storage.WriteNoteContent(mockNote.Filename, "test content")
	assert.NoError(t, err)

	tests := []struct {
		name    string
		args    []string
		flags   map[string]string
		wantErr bool
		errMsg  string
		setup   func()
	}{
		{
			name:    "no args and no title flag",
			args:    []string{},
			wantErr: true,
			errMsg:  "noted is locked",
		},
		{
			name:    "with invalid note ID",
			args:    []string{"invalid-id"},
			wantErr: true,
			errMsg:  "noted is locked",
		},
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
			if tt.setup != nil {
				tt.setup()
			}

			cmd := &cobra.Command{}
			cmd.Flags().StringP("title", "t", "", "Title of the note")
			for k, v := range tt.flags {
				cmd.Flags().Set(k, v) //nolint:errcheck // Ignoring error check in test
			}

			err := diffCmd.RunE(cmd, tt.args)
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

func TestDiffCmdFlags(t *testing.T) {
	assert.NotNil(t, diffCmd.Flags().Lookup("title"))
}

func TestPrintUnifiedDiff(t *testing.T) {
	tests := []struct {
		name    string
		oldText string
		newText string
		wantErr bool
	}{
		{
			name:    "identical texts",
			oldText: "test\ntext",
			newText: "test\ntext",
			wantErr: false,
		},
		{
			name:    "different texts",
			oldText: "old\ntext",
			newText: "new\ntext",
			wantErr: false,
		},
		{
			name:    "empty texts",
			oldText: "",
			newText: "",
			wantErr: false,
		},
		{
			name:    "one empty text",
			oldText: "test",
			newText: "",
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			printUnifiedDiff(tt.oldText, tt.newText)
		})
	}
}
