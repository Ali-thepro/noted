package version

import (
	"fmt"
	"github.com/spf13/cobra"
	"noted/internal/api"
	"noted/internal/storage"
	"strings"
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

		var maxVerLen, maxTitleLen, maxTagsLen int
		for _, v := range versions {
			verLen := len(fmt.Sprintf("#%d", v.Metadata.VersionNumber))
			if verLen > maxVerLen {
				maxVerLen = verLen
			}
			if len(v.Metadata.Title) > maxTitleLen {
				maxTitleLen = len(v.Metadata.Title)
			}
			tagsLen := len(strings.Join(v.Metadata.Tags, ", "))
			if tagsLen == 0 {
				tagsLen = 6
			}
			if tagsLen > maxTagsLen {
				maxTagsLen = tagsLen
			}
		}

		if maxVerLen < 3 {
			maxVerLen = 3
		}

		headerFmt := fmt.Sprintf("%%-%ds  %%-20s  %%-%ds  %%-%ds\n", maxVerLen, maxTitleLen, maxTagsLen)
		fmt.Printf(headerFmt, "Ver", "Created", "Title", "Tags")
		fmt.Println(strings.Repeat("-", maxVerLen+maxTitleLen+maxTagsLen+27))

		for _, v := range versions {
			tags := strings.Join(v.Metadata.Tags, ", ")
			if tags == "" {
				tags = "no tags"
			}

			fmt.Printf(fmt.Sprintf("%%-%ds  %%-20s  %%-%ds  %%-%ds\n", maxVerLen, maxTitleLen, maxTagsLen),
				fmt.Sprintf("#%d", v.Metadata.VersionNumber),
				v.CreatedAt.Format("2006-01-02 15:04:05"),
				v.Metadata.Title,
				tags,
			)
		}

		return nil
	},
}

func init() {
	listCmd.Flags().StringP("title", "t", "", "Title of the note to list versions for")
}
