package cmd

import (
	"fmt"
	"noted/internal/config"
	"github.com/spf13/cobra"
	"noted/internal/storage"
	"noted/internal/token"
	"path/filepath"
)

var editCmd = &cobra.Command{
	Use: "edit [id]",
	Short: "Edit a note",
	Long: `Edit a note using your default text editor.
You can specify either the note ID/shortID as an argument or use --title flag`,
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

		dir, err := token.GetConfigDir()
		if err != nil {
			return fmt.Errorf("failed to get condfig directory: %w", err)
		}

		notepath := filepath.Join(dir, noteToEdit.Filename)
		if err := config.OpenInEditor(notepath); err != nil {
			return fmt.Errorf("failed to open note in editor: %w", err)
		}
		
		return nil
	},
}

func init() {
	rootCmd.AddCommand(editCmd)
	editCmd.Flags().StringP("title", "t", "", "Title of the note to edit")
}