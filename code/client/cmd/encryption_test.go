package cmd

import (
	"testing"

	"github.com/spf13/cobra"
	"github.com/stretchr/testify/assert"
)

func TestSetupEncryptionCmd(t *testing.T) {
	// Create temp test directory
	tmpDir := t.TempDir()
	t.Setenv("NOTED_CONFIG_DIR", tmpDir)

	tests := []struct {
		name    string
		wantErr bool
		errMsg  string
	}{
		{
			name:    "setup encryption without token",
			wantErr: true,
			errMsg:  "failed to check encryption status: failed to get encryption status: failed to load token",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			cmd := &cobra.Command{}
			err := setupEncryptionCmd.RunE(cmd, []string{})

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

func TestSetupEncryptionCmdInit(t *testing.T) {
	cmd := rootCmd.Commands()
	found := false
	for _, c := range cmd {
		if c == setupEncryptionCmd {
			found = true
			break
		}
	}
	assert.True(t, found, "setupEncryptionCmd should be added to rootCmd")
}
