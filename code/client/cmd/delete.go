package cmd

import (
	"fmt"
	"github.com/spf13/cobra"
	"noted/internal/api"
	"noted/internal/storage"
)

var deleteCmd = &cobra.Command{
	Use:   "delete [id]",
	Short: "Delete a note",
	Long: `Delete a note using either its ID or title. 
You can specify either the note ID as an argument or use --title flag.`,
	RunE: func(cmd *cobra.Command, args []string) error {
		var noteToDelete *storage.Note
		var err error

		if len(args) > 0 {
			noteToDelete, err = storage.GetNoteByID(args[0])
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

			noteToDelete, err = storage.SelectNote(title)
			if err != nil {
				return err
			}
		}

		fmt.Printf("Are you sure you want to delete note \"%s\"? (y/N): ",
			noteToDelete.Title,
		)

		var response string
		_, err = fmt.Scanln(&response)
		if err != nil {
			return fmt.Errorf("failed to read user input: %w", err)
		}
		if response != "y" && response != "Y" {
			return fmt.Errorf("operation cancelled")
		}

		client, err := api.NewClient()
		if err != nil {
			return err
		}

		if err := storage.DeleteNote(noteToDelete.ID); err != nil {
			return fmt.Errorf("failed to delete local note data: %w", err)
		}

		if err := client.DeleteNote(noteToDelete.ID); err != nil {
			return fmt.Errorf("failed to delete note from server: %w", err)
		}

		fmt.Printf("Note \"%s\" deleted successfully\n", noteToDelete.Title)
		return nil
	},
}

func init() {
	rootCmd.AddCommand(deleteCmd)
	deleteCmd.Flags().StringP("title", "t", "", "Title of the note to delete")
}
