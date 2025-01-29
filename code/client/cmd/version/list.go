package version

import (
	"fmt"
	"noted/internal/api"
	"noted/internal/storage"
	"strings"
	"time"

	"github.com/spf13/cobra"
)

var listCmd = &cobra.Command{
	Use:   "list [id]",
	Short: "List versions of a note",
	Long:  `List all versions of a note. You can specify either the note ID as an argument or use --title flag.`,
	RunE: func(cmd *cobra.Command, args []string) error {
		var noteToList *storage.Note
		var err error

		if len(args) > 0 {
			noteToList, err = storage.GetNoteByID(args[0])
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

			noteToList, err = storage.SelectNote(title)
			if err != nil {
				return err
			}
		}

		client, err := api.NewClient()
		if err != nil {
			return err
		}

		versions, err := client.GetVersions(noteToList.ID)
		if err != nil {
			return fmt.Errorf("failed to get versions: %w", err)
		}

		if len(versions) == 0 {
			return fmt.Errorf("no versions found for note")
		}

		fmt.Printf("Versions for note \"%s\":\n\n", noteToList.Title)
		fmt.Printf("%-4s  %-8s  %-20s  %-s\n", "Ver", "Type", "Created", "Tags")
		fmt.Println(strings.Repeat("-", 80))

		for _, v := range versions {
			tags := strings.Join(v.Metadata.Tags, ", ")
			if tags == "" {
				tags = "none"
			}

			fmt.Printf("#%-3d  %-8s  %-20s  %s\n",
				v.Metadata.VersionNumber,
				v.Type,
				v.CreatedAt.Format(time.RFC822),
				tags,
			)
		}

		return nil
	},
}

func init() {
	listCmd.Flags().StringP("title", "t", "", "Title of the note to list versions for")
}
