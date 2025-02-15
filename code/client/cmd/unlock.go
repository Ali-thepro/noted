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
	Short: "Unlock noted for a limited time (1 hour)",
	RunE: func(cmd *cobra.Command, args []string) error {
		symmetricKey, err := auth.EncryptionLogin()
		if err != nil {
			return err
		}

		fmt.Print(base64.StdEncoding.EncodeToString(symmetricKey))
		fmt.Fprintln(os.Stderr, "noted unlocked")
		return nil
	},
}

func init() {
	rootCmd.AddCommand(unlockCmd)
}
