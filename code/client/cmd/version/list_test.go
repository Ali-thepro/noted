package version

import (
	"testing"
	"time"

	"noted/internal/storage"

	"github.com/spf13/cobra"
	"github.com/stretchr/testify/assert"
)

func TestListCmd(t *testing.T) {
	// Create temp test directory
	//https://gobyexample.com/temporary-files-and-directories#:~:text=Go%20by%20Example%3A%20Temporary%20Files%20and%20Directories,-Throughout%20program%20execution&text=The%20easiest%20way%20to%20create,the%20first%20argument%2C%20so%20os.
	tmpDir := t.TempDir()
	t.Setenv("NOTED_CONFIG_DIR", tmpDir)

	// Setup test data
	mockNote := &storage.Note{
		ID:        "test-id",
		Title:     "Test Note",
		Filename:  "test-note.md",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	index := &storage.Index{Notes: []storage.Note{*mockNote}}
	err := storage.SaveIndex(index)
	assert.NoError(t, err)

	tests := []struct {
		name    string
		args    []string
		flags   map[string]string
		wantErr bool
	}{
		{
			name:    "no args and no title flag",
			args:    []string{},
			wantErr: true,
		},
		{
			name:    "with note ID",
			args:    []string{"test-id"},
			wantErr: true, // Will fail due to API call
		},
		{
			name: "with title flag",
			args: []string{},
			flags: map[string]string{
				"title": "Test Note",
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			cmd := &cobra.Command{}
			cmd.Flags().StringP("title", "t", "", "Title of the note")
			for k, v := range tt.flags {
				cmd.Flags().Set(k, v)
			}

			err := listCmd.RunE(cmd, tt.args)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestListCmdFlags(t *testing.T) {
	assert.NotNil(t, listCmd.Flags().Lookup("title"))
}
