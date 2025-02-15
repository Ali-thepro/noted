package cmd

import (
	"fmt"
	"github.com/sergi/go-diff/diffmatchpatch"
	"github.com/spf13/cobra"
	"noted/cmd/version"
	"noted/internal/api"
	"noted/internal/storage"
	"noted/internal/utils"
	"strings"
)

var editDataCmd = &cobra.Command{
	Use:   "edit-data [id]",
	Short: "Edit note metadata, required noted to be unlocked",
	Long: `Edit note title and tags. 
You can specify either the note ID as an argument or use --title flag.
By default, new tags are appended to existing ones. Use --replace-tags to overwrite instead.
Requires noted to be unlocked.`,
	RunE: func(cmd *cobra.Command, args []string) error {
		var noteToEdit *storage.Note
		var err error
		var newFilename string

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

		newFilename, err = storage.UpdateNoteMetadata(noteToEdit, note)
		if err != nil {
			return fmt.Errorf("failed to update local note metadata: %w", err)
		}

		if note.Title != noteToEdit.Title || !utils.StringSliceEqual(note.Tags, noteToEdit.Tags) {
			versions, err := client.GetVersions(noteToEdit.ID)
			if err != nil {
				return fmt.Errorf("failed to get versions: %w", err)
			}

			if len(versions) == 0 {
				return fmt.Errorf("no versions found for note")
			}

			latestVersion := versions[0]
			versionType := "diff"
			var versionContent string
			var baseVersion string

			content, err := storage.ReadNoteContent(newFilename)
			if err != nil {
				return fmt.Errorf("failed to read note content: %w", err)
			}

			if ShouldCreateSnapshot(latestVersion) {
				versionType = "snapshot"
				versionContent = content
			} else {
				var baseContent string
				if latestVersion.Type == "snapshot" {
					baseContent = latestVersion.Content
				} else {
					chain, err := client.GetVersionChain(noteToEdit.ID, latestVersion.CreatedAt)
					if err != nil {
						return fmt.Errorf("failed to get version chain: %w", err)
					}
					baseContent = version.BuildVersionContent(chain)
				}

				dmp := diffmatchpatch.New()
				diffs := dmp.DiffMain(baseContent, content, false)
				diffs = dmp.DiffCleanupEfficiency(diffs)
				versionContent = dmp.DiffToDelta(diffs)
				baseVersion = latestVersion.ID
			}

			_, err = client.CreateVersion(noteToEdit.ID, &api.CreateVersionRequest{
				Type:        versionType,
				Content:     versionContent,
				BaseVersion: baseVersion,
				Metadata: api.VersionMetadata{
					Title:         note.Title,
					Tags:          note.Tags,
					VersionNumber: latestVersion.Metadata.VersionNumber + 1,
				},
			})
			if err != nil {
				return fmt.Errorf("failed to create version: %w", err)
			}
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
