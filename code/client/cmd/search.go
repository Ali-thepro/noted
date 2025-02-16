package cmd

import (
	"fmt"
	"github.com/spf13/cobra"
	"noted/internal/api"
	"strings"
	"time"
)

var searchCmd = &cobra.Command{
	Use:   "search",
	Short: "Search for notes by title or tag",
	Long:  `Search for notes using title or tags. You can use --title for title search and --tag for tag search.`,
	RunE: func(cmd *cobra.Command, args []string) error {
		title, _ := cmd.Flags().GetString("title")
		tag, _ := cmd.Flags().GetString("tag")

		if title == "" && tag == "" {
			return fmt.Errorf("please provide either a title or a tag")
		}

		client, err := api.NewClient()
		if err != nil {
			return fmt.Errorf("failed to create client: %w", err)
		}

		searchResp, err := client.SearchNotes(title, tag)
		if err != nil {
			return fmt.Errorf("failed to search notes: %w", err)
		}

		if len(searchResp.Notes) == 0 {
			fmt.Println("No notes found")
			return nil
		}

		var maxTitleLen, maxTagsLen int
		for _, note := range searchResp.Notes {
			if len(note.Title) > maxTitleLen {
				maxTitleLen = len(note.Title)
			}
			tagsLen := len(strings.Join(note.Tags, ", "))
			if tagsLen == 0 {
				tagsLen = 6
			}
			if tagsLen > maxTagsLen {
				maxTagsLen = tagsLen
			}
		}

		if maxTitleLen > 70 {
			maxTitleLen = 70
		}

		headerFmt := fmt.Sprintf("%%-%ds  %%-%ds  %%-%ds  %%-%ds\n", maxTitleLen, maxTagsLen, 19, 24)
		fmt.Printf(headerFmt, "Title", "Tags", "Updated", "ID")
		fmt.Println(strings.Repeat("-", maxTitleLen+maxTagsLen+19+24+6))

		for _, note := range searchResp.Notes {
			updatedAt, _ := time.Parse(time.RFC3339, note.UpdatedAt)
			tags := strings.Join(note.Tags, ", ")
			if tags == "" {
				tags = "no tags"
			}

			fmt.Printf(headerFmt,
				note.Title,
				tags,
				updatedAt.Format("2006-01-02 15:04:05"),
				note.ID,
			)
		}
		if searchResp.Total > 1 {
			fmt.Printf("\nFound %d notes\n", searchResp.Total)
		} else {
			fmt.Printf("\nFound %d note\n", searchResp.Total)
		}

		return nil
	},
}

func init() {
	rootCmd.AddCommand(searchCmd)
	searchCmd.Flags().StringP("title", "t", "", "Search notes by title")
	searchCmd.Flags().StringP("tag", "g", "", "Search notes by tag")
}
