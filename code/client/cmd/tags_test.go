package cmd

import (
	"testing"

	"github.com/spf13/cobra"
	"github.com/stretchr/testify/assert"
)

func TestTagsCmd(t *testing.T) {
	tests := []struct {
		name       string
		args       []string
		flags      map[string]string
		wantErr    bool
		wantErrMsg string
	}{
		{
			name:       "no args or flags",
			args:       []string{},
			flags:      map[string]string{},
			wantErr:    true,
			wantErrMsg: "either provide a note ID as an argument or use --title flag",
		},
		{
			name:    "with title flag",
			args:    []string{},
			flags:   map[string]string{"title": "test-note"},
			wantErr: false,
		},
		{
			name:    "with note ID",
			args:    []string{"note-id-123"},
			flags:   map[string]string{},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			cmd := &cobra.Command{}
			cmd.Flags().StringP("title", "t", "", "Title of the note to show tags for")

			// Set flags if any
			for flagName, flagValue := range tt.flags {
				err := cmd.Flags().Set(flagName, flagValue)
				assert.NoError(t, err)
			}

			err := tagsCmd.RunE(cmd, tt.args)
			if tt.wantErr {
				assert.Error(t, err)
				if tt.wantErrMsg != "" {
					assert.Contains(t, err.Error(), tt.wantErrMsg)
				}
			} else {
				assert.Error(t, err)
			}
		})
	}
}
