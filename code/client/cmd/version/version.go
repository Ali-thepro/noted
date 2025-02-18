package version

import (
	"github.com/spf13/cobra"
)

var VersionCmd = &cobra.Command{
	Use:   "version",
	Short: "Manage note versions, requires noted to be unlocked",
	Long: `Manage note versions - list, show, restore and diff versions of notes.
Requires noted to be unlocked.`,
}

func init() {
	VersionCmd.AddCommand(listCmd)
	VersionCmd.AddCommand(showCmd)
	VersionCmd.AddCommand(restoreCmd)
	VersionCmd.AddCommand(diffCmd)
}
