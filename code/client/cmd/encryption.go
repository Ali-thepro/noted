package cmd

import (
	"fmt"
	"noted/internal/api"
	"noted/internal/auth"

	"github.com/spf13/cobra"
)

var setupEncryptionCmd = &cobra.Command{
	Use:   "setup-encryption",
	Short: "Setup encryption for your notes only if it is not already set up",
	Long:  `Setup encryption for your notes by creating a master password only if it is not already set up`,
	RunE: func(cmd *cobra.Command, args []string) error {
		client, err := api.NewClient()
		if err != nil {
			return fmt.Errorf("failed to create client: %w", err)
		}

		hasEncryption, err := client.EncryptionStatus()
		if err != nil {
			return fmt.Errorf("failed to check encryption status: %w", err)
		}

		if hasEncryption {
			return fmt.Errorf("encryption is already set up")
		}

		if err := auth.SetupEncryption(); err != nil {
			return fmt.Errorf("failed to setup encryption: %w", err)
		}

		return nil
	},
}

func init() {
	rootCmd.AddCommand(setupEncryptionCmd)
}
