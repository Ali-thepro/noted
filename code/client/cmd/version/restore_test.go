package version

import (
	"testing"
	"time"

	"noted/internal/api"
	"noted/internal/storage"

	"github.com/spf13/cobra"
	"github.com/stretchr/testify/assert"
)

func TestRestoreCmd(t *testing.T) {
	tmpDir := t.TempDir()
	t.Setenv("NOTED_CONFIG_DIR", tmpDir)
	t.Setenv("NOTED_KEY", "dGVzdGtleXRlc3RrZXk=") // base64 encoded testkeytest

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

	//sample data to test
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
			name:    "with valid note ID",
			args:    []string{"test-id"},
			wantErr: true,
			errMsg:  "failed to get versions: failed to load token",
		},
		{
			name: "with title flag",
			args: []string{},
			flags: map[string]string{
				"title": "Test Note",
			},
			wantErr: true,
			errMsg:  "failed to get versions: failed to load token",
		},
		{
			name:    "with invalid version number",
			args:    []string{"test-id", "invalid"},
			wantErr: true,
			errMsg:  "failed to get versions: failed to load token",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			cmd := &cobra.Command{}
			cmd.Flags().StringP("title", "t", "", "Title of the note")
			for k, v := range tt.flags {
				cmd.Flags().Set(k, v)
			}

			err := restoreCmd.RunE(cmd, tt.args)
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

// Mock API client implementation
type mockAPIClient struct {
	api.Client
	versions []*api.Version
	note     *api.Note
}

func (m *mockAPIClient) GetVersions(noteID string) ([]*api.Version, error) {
	return m.versions, nil
}

func (m *mockAPIClient) GetNote(noteID string) (*api.Note, error) {
	return m.note, nil
}

func (m *mockAPIClient) UpdateNote(noteID string, req api.UpdateNoteRequest) (*api.Note, error) {
	return m.note, nil
}

func (m *mockAPIClient) CreateVersion(noteID string, req *api.CreateVersionRequest) (*api.Version, error) {
	return m.versions[0], nil
}

func TestRestoreCmdFlags(t *testing.T) {
	assert.NotNil(t, restoreCmd.Flags().Lookup("title"))
}
