package cmd

import (
	"testing"

	"github.com/spf13/cobra"
	"github.com/stretchr/testify/assert"
)

func TestSearchCmd(t *testing.T) {
	tests := []struct {
		name       string
		args       []string
		wantErr    bool
		wantErrMsg string
	}{
		{
			name:       "no flags provided",
			args:       []string{},
			wantErr:    true,
			wantErrMsg: "please provide either a title or a tag",
		},
		{
			name:    "with title flag",
			args:    []string{"--title", "test"},
			wantErr: false,
		},
		{
			name:    "with tag flag",
			args:    []string{"--tag", "important"},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			cmd := &cobra.Command{}
			cmd.Flags().StringP("title", "t", "", "Search notes by title")
			cmd.Flags().StringP("tag", "g", "", "Search notes by tag")

			err := cmd.ParseFlags(tt.args)
			assert.NoError(t, err)

			title, _ := cmd.Flags().GetString("title")
			tag, _ := cmd.Flags().GetString("tag")

			if title == "" && tag == "" {
				err = searchCmd.RunE(cmd, tt.args)
				if tt.wantErr {
					assert.Error(t, err)
					if tt.wantErrMsg != "" {
						assert.Contains(t, err.Error(), tt.wantErrMsg)
					}
				} else {
					assert.NoError(t, err)
				}
			}
		})
	}
}
