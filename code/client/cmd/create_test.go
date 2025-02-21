package cmd

import (
	"testing"
	"time"

	"noted/internal/storage"

	"github.com/spf13/cobra"
	"github.com/stretchr/testify/assert"
)

func TestCreateCmd(t *testing.T) {
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

	index := &storage.Index{Notes: []storage.Note{*mockNote}}
	err := storage.SaveIndex(index)
	assert.NoError(t, err)

	tests := []struct {
		name    string
		flags   map[string]string
		wantErr bool
		errMsg  string
	}{
		{
			name: "with valid title",
			flags: map[string]string{
				"title": "New Test Note",
			},
			wantErr: true,
			errMsg:  "noted is locked",
		},
		{
			name: "with valid title and tags",
			flags: map[string]string{
				"title": "New Test Note",
				"tags":  "tag1,tag2",
			},
			wantErr: true,
			errMsg:  "noted is locked",
		},
		{
			name: "with empty tag",
			flags: map[string]string{
				"title": "New Test Note",
				"tags":  "tag1,,tag2",
			},
			wantErr: true,
			errMsg:  "noted is locked",
		},
		{
			name: "with duplicate tags",
			flags: map[string]string{
				"title": "New Test Note",
				"tags":  "tag1,tag1",
			},
			wantErr: true,
			errMsg:  "noted is locked",
		},
		{
			name: "with long tag",
			flags: map[string]string{
				"title": "New Test Note",
				"tags":  "thistagiswaytoolongtobevalid",
			},
			wantErr: true,
			errMsg:  "noted is locked",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			cmd := &cobra.Command{}
			cmd.Flags().StringP("title", "t", "", "Title of the note")
			cmd.Flags().StringSlice("tags", []string{}, "Tags for the note")

			for k, v := range tt.flags {
				cmd.Flags().Set(k, v)
			}

			err := createCmd.RunE(cmd, []string{})
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

func TestCreateCmdFlags(t *testing.T) {
	assert.NotNil(t, createCmd.Flags().Lookup("title"))
	assert.NotNil(t, createCmd.Flags().Lookup("tags"))
}

func TestValidateTags(t *testing.T) {
	tests := []struct {
		name    string
		tags    []string
		want    []string
		wantErr bool
		errMsg  string
	}{
		{
			name:    "empty tags",
			tags:    []string{},
			want:    []string{},
			wantErr: false,
		},
		{
			name:    "valid tags",
			tags:    []string{"tag1", "tag2"},
			want:    []string{"tag1", "tag2"},
			wantErr: false,
		},
		{
			name:    "tags with spaces",
			tags:    []string{" tag1 ", "tag2 "},
			want:    []string{"tag1", "tag2"},
			wantErr: false,
		},
		{
			name:    "empty tag",
			tags:    []string{"tag1", ""},
			wantErr: true,
			errMsg:  "tag cannot be empty",
		},
		{
			name:    "duplicate tags",
			tags:    []string{"tag1", "tag1"},
			wantErr: true,
			errMsg:  "duplicate tag 'tag1' found",
		},
		{
			name:    "long tag",
			tags:    []string{"thistagiswaytoolongtobevalid"},
			wantErr: true,
			errMsg:  "exceeds maximum length of 20 characters",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := validateTags(tt.tags)
			if tt.wantErr {
				assert.Error(t, err)
				if tt.errMsg != "" {
					assert.Contains(t, err.Error(), tt.errMsg)
				}
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.want, got)
			}
		})
	}
}
