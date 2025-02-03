package cmd

import (
	"fmt"
	"noted/internal/storage"
	"sort"
	"strings"

	"github.com/spf13/cobra"
)

var listCmd = &cobra.Command{
	Use:   "list",
	Short: "List all notes",
	Long:  `Display a list of all notes with their IDs, titles, and timestamps`,
	RunE: func(cmd *cobra.Command, args []string) error {
		index, err := storage.LoadIndex()
		if err != nil {
			return fmt.Errorf("failed to list notes: %w", err)
		}

		if len(index.Notes) == 0 {
			fmt.Println("No notes found")
			return nil
		}

		var maxIDLen, maxTitleLen int
		for _, note := range index.Notes {
			if len(note.ID) > maxIDLen {
				maxIDLen = len(note.ID)
			}
			if len(note.Title) > maxTitleLen {
				maxTitleLen = len(note.Title)
			}
		}

		if maxTitleLen > 70 {
			maxTitleLen = 70
		}

		headerFmt := fmt.Sprintf("%%-%ds  %%-%ds\n", maxIDLen, maxTitleLen)

		fmt.Printf("\n"+headerFmt, "ID", "TITLE", "UPDATED")
		fmt.Println(strings.Repeat("-", maxIDLen+maxTitleLen+24))

		sort.Slice(index.Notes, func(i, j int) bool {
			return index.Notes[i].UpdatedAt.After(index.Notes[j].UpdatedAt)
		})

		for _, note := range index.Notes {
			title := note.Title
			if len(title) > maxTitleLen {
				title = title[:maxTitleLen-3] + "..."
			}

			fmt.Printf(headerFmt,
				note.ID,
				title,
				note.UpdatedAt.Format("2006-01-02 15:04:05"),
			)
		}
		fmt.Println()
		return nil
	},
}

func init() {
	rootCmd.AddCommand(listCmd)
}
