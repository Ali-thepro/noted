package cmd

import (
	"fmt"
	"github.com/spf13/cobra"
	"noted/internal/storage"
	"strings"
)

var tagsCmd = &cobra.Command{
	Use:   "tags [id]",
	Short: "Display tags for a note",
	Long: `Display tags for a note.
You can specify either the note ID/shortID as an argument or use --title flag.`,
	RunE: func(cmd *cobra.Command, args []string) error {
		var noteToShow *storage.Note
		var err error

		if len(args) > 0 {
			noteToShow, err = storage.GetNoteByID(args[0])
			if err != nil {
				return err
			}
		} else {
			title, err := cmd.Flags().GetString("title")
			if err != nil {
				return err
			}
			if title == "" {
				return fmt.Errorf("either provide a note ID as an argument or use --title flag")
			}

			noteToShow, err = storage.SelectNote(title)
			if err != nil {
				return err
			}
		}

		fmt.Printf("Title: %s\n", noteToShow.Title)
		if len(noteToShow.Tags) > 0 {
			fmt.Printf("Tags: %s\n", strings.Join(noteToShow.Tags, ", "))
		} else {
			fmt.Println("No tags")
		}

		return nil
	},
}

func init() {
	rootCmd.AddCommand(tagsCmd)
	tagsCmd.Flags().StringP("title", "t", "", "Title of the note to show tags for")
}
