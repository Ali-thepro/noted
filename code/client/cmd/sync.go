package cmd

import (
	"fmt"
	"noted/internal/storage"

	"github.com/spf13/cobra"
)

var syncCmd = &cobra.Command{
	Use:   "sync",
	Short: "Synchronize notes with the server",
	Long: `Synchronize your local notes with the server.
This will download new notes and update existing ones.`,
	RunE: func(cmd *cobra.Command, args []string) error {
		tag, _ := cmd.Flags().GetString("tag")
		verbose, _ := cmd.Flags().GetBool("verbose")

		fmt.Println("Syncing notes...")

		stats, err := storage.SyncNotes(storage.SyncOptions{
			Tag: tag,
		})
		if err != nil {
			return fmt.Errorf("sync failed: %w", err)
		}

		if stats.TotalNotes == 0 {
			fmt.Println("Everything up to date!")
			return nil
		}

		if verbose {
			if stats.NewNotes > 0 {
				fmt.Printf("✓ Downloaded %d new notes\n", stats.NewNotes)
			}
			if stats.UpdatedNotes > 0 {
				fmt.Printf("✓ Updated %d existing notes\n", stats.UpdatedNotes)
			}
			if stats.DeletedNotes > 0 {
				fmt.Printf("✓ Deleted %d notes\n", stats.DeletedNotes)
			}
			fmt.Printf("Total notes: %d\n", stats.TotalNotes)
		} else {
			fmt.Printf("✓ Synced %d notes\n", stats.NewNotes+stats.UpdatedNotes)
		}

		return nil
	},
}

func init() {
	rootCmd.AddCommand(syncCmd)
	syncCmd.Flags().BoolP("force", "f", false, "Force sync all notes")
	syncCmd.Flags().StringP("tag", "t", "", "Sync only notes with specific tag")
	syncCmd.Flags().BoolP("verbose", "v", false, "Show detailed sync information")
}
