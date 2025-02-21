package cmd

import (
	"fmt"
	"github.com/charmbracelet/glamour"
	"github.com/spf13/cobra"
	"noted/internal/config"
	"noted/internal/storage"
)

var previewCmd = &cobra.Command{
	Use:   "preview [id]",
	Short: "Preview a note with markdown formatting",
	Long: `Preview a note's content with markdown formatting using glamour.
You can specify either the note ID as an argument or use --title flag.`,
	RunE: func(cmd *cobra.Command, args []string) error {
		var noteToPreview *storage.Note
		var err error

		if len(args) > 0 {
			noteToPreview, err = storage.GetNoteByID(args[0])
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

			noteToPreview, err = storage.SelectNote(title)
			if err != nil {
				return err
			}
		}

		content, err := storage.ReadNoteContent(noteToPreview.Filename)
		if err != nil {
			return fmt.Errorf("failed to read note content: %w", err)
		}

		renderer, err := glamour.NewTermRenderer(
			func() glamour.TermRendererOption {
				cfg := config.NewConfig()
				if cfg.Theme == "auto" {
					return glamour.WithAutoStyle()
				}
				return glamour.WithStylePath(cfg.Theme)
			}(),
			glamour.WithWordWrap(80),
		)
		if err != nil {
			return fmt.Errorf("failed to create markdown renderer: %w", err)
		}

		rendered, err := renderer.Render(content)
		if err != nil {
			return fmt.Errorf("failed to render markdown: %w", err)
		}

		fmt.Print(rendered)
		return nil
	},
}

func init() {
	rootCmd.AddCommand(previewCmd)
	previewCmd.Flags().StringP("title", "t", "", "Title of the note to render")
}
