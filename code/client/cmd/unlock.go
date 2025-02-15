package cmd

import (
	"encoding/base64"
	"fmt"
	"github.com/spf13/cobra"
	"noted/internal/auth"
	"os"
)

var unlockCmd = &cobra.Command{
	Use:   "unlock",
	Short: "Unlock noted for the current session",
	RunE: func(cmd *cobra.Command, args []string) error {
		symmetricKey, err := auth.EncryptionLogin()
		if err != nil {
			return err
		}

		encodedKey := base64.StdEncoding.EncodeToString(symmetricKey)
		os.Setenv("NOTED_TEMP_KEY", encodedKey)
		fmt.Fprintln(os.Stdout, "noted unlocked")
		return nil
	},
}

func init() {
	rootCmd.AddCommand(unlockCmd)
}
