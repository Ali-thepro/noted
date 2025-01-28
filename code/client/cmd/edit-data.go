package cmd

import (
	"fmt"
	"github.com/spf13/cobra"
	"noted/internal/api"
	"noted/internal/storage"
	"strings"
)

var editDataCmd = &cobra.Command{
	Use:   "edit-data [id]",
	Short: "Edit note metadata",
	Long: `Edit note title and tags. 
You can specify either the note ID as an argument or use --title flag.
By default, new tags are appended to existing ones. Use --replace-tags to overwrite instead.`,
	RunE: func(cmd *cobra.Command, args []string) error {
		var noteToEdit *storage.Note
		var err error

		if len(args) > 0 {
			noteToEdit, err = storage.GetNoteByID(args[0])
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

			noteToEdit, err = storage.SelectNote(title)
			if err != nil {
				return err
			}
		}

		newTitle, err := cmd.Flags().GetString("new-title")
		if err != nil {
			return err
		}
		if newTitle == "" {
			newTitle = noteToEdit.Title
		}

		newTags, err := cmd.Flags().GetStringSlice("tags")
		if err != nil {
			return err
		}

		replace, err := cmd.Flags().GetBool("replace")
		if err != nil {
			return err
		}

		var finalTags []string
		if len(newTags) > 0 {
			validTags, err := validateTags(newTags)
			if err != nil {
				return err
			}

			if replace {
				finalTags = validTags
			} else {
				tagSet := make(map[string]struct{})
				for _, tag := range noteToEdit.Tags {
					tagSet[tag] = struct{}{}
				}
				for _, tag := range validTags {
					tagSet[tag] = struct{}{}
				}

				finalTags = make([]string, 0, len(tagSet))
				for tag := range tagSet {
					finalTags = append(finalTags, tag)
				}
			}
		} else {
			finalTags = noteToEdit.Tags
		}

		client, err := api.NewClient()
		if err != nil {
			return err
		}

		note, err := client.UpdateNoteMetadata(noteToEdit.ID, api.UpdateNoteMetadataRequest{
			Title: newTitle,
			Tags:  finalTags,
		})
		if err != nil {
			return fmt.Errorf("failed to update note metadata on server: %w", err)
		}

		if err := storage.UpdateNoteMetadata(noteToEdit, note); err != nil {
			return fmt.Errorf("failed to update local note metadata: %w", err)
		}

		fmt.Printf("Note metadata updated successfully!\n")
		fmt.Printf("Title: %s\n", note.Title)
		fmt.Printf("ID: %s\n", note.ID)
		if len(note.Tags) > 0 {
			fmt.Printf("Tags: %v\n", strings.Join(note.Tags, ", "))
		}
		return nil
	},
}

func init() {
	rootCmd.AddCommand(editDataCmd)
	editDataCmd.Flags().StringP("title", "t", "", "Current title of the note to edit")
	editDataCmd.Flags().StringP("new-title", "n", "", "New title for the note")
	editDataCmd.Flags().StringSlice("tags", []string{}, "Tags to add/replace (comma-separated)")
	editDataCmd.Flags().BoolP("replace", "r", false, "Replace existing tags instead of appending")
}
