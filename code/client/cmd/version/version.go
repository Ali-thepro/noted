package version

import (
	"github.com/spf13/cobra"
)

var VersionCmd = &cobra.Command{
	Use:   "version",
	Short: "Manage note versions",
	Long:  `Manage note versions - list, show, and restore versions of notes.`,
}

func init() {
	VersionCmd.AddCommand(listCmd)
	// VersionCmd.AddCommand(showCmd)
	// VersionCmd.AddCommand(restoreCmd)
}
