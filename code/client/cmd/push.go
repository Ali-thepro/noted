package cmd

import (
	"fmt"
	"github.com/sergi/go-diff/diffmatchpatch"
	"github.com/spf13/cobra"
	"noted/internal/api"
	"noted/internal/storage"
	"noted/internal/utils"
	"strings"
)

var pushCmd = &cobra.Command{
	Use:   "push [id]",
	Short: "Push note changes to server, required noted to be unlocked",
	Long: `Push note changes to the server. 
You can specify either the note ID as an argument or use --title flag.
Requires noted to be unlocked.`,
	RunE: func(cmd *cobra.Command, args []string) error {
		var noteToPush *storage.Note
		var err error

		if len(args) > 0 {
			noteToPush, err = storage.GetNoteByID(args[0])
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

			noteToPush, err = storage.SelectNote(title)
			if err != nil {
				return err
			}
		}

		content, err := storage.ReadNoteContent(noteToPush.Filename)
		if err != nil {
			return fmt.Errorf("failed to read note content: %w", err)
		}

		client, err := api.NewClient()
		if err != nil {
			return err
		}

		versions, err := client.GetVersions(noteToPush.ID)
		if err != nil {
			return fmt.Errorf("failed to get versions: %w", err)
		}
		if len(versions) == 0 {
			return fmt.Errorf("no versions found for note")
		}

		latestVersion := versions[0]

		var baseContent string
		if latestVersion.Type == "snapshot" {
			baseContent = latestVersion.Content
		} else {
			chain, err := client.GetVersionChain(noteToPush.ID, latestVersion.CreatedAt)
			if err != nil {
				return fmt.Errorf("failed to get version chain: %w", err)
			}
			baseContent = utils.BuildVersionContent(chain)
		}

		if baseContent == content {
			fmt.Println("No changes detected. Nothing to push.")
			return nil
		}

		versionType := "diff"
		var versionContent string
		var baseVersion string

		if ShouldCreateSnapshot(latestVersion) {
			versionType = "snapshot"
			versionContent = content
		} else {
			dmp := diffmatchpatch.New()
			diffs := dmp.DiffMain(baseContent, content, false)
			diffs = dmp.DiffCleanupEfficiency(diffs)
			versionContent = dmp.DiffToDelta(diffs)
			baseVersion = latestVersion.ID
		}

		_, err = client.CreateVersion(noteToPush.ID, &api.CreateVersionRequest{
			Type:        versionType,
			Content:     versionContent,
			BaseVersion: baseVersion,
			Metadata: api.VersionMetadata{
				Title:         noteToPush.Title,
				Tags:          noteToPush.Tags,
				VersionNumber: latestVersion.Metadata.VersionNumber + 1,
			},
		})
		if err != nil {
			return fmt.Errorf("failed to create version: %w", err)
		}

		note, err := client.UpdateNote(noteToPush.ID, api.UpdateNoteRequest{
			Content: content,
		})
		if err != nil {
			if err.Error() == "note has already been deleted from the server" {
				if err := storage.DeleteNote(noteToPush.ID); err != nil {
					return fmt.Errorf("failed to delete local note after server deletion: %w", err)
				}
			}
			return fmt.Errorf("failed to update note on server: %w", err)
		}

		if err := storage.UpdateNote(note); err != nil {
			return fmt.Errorf("failed to update local note data: %w", err)
		}

		fmt.Printf("Note \"%s\" pushed successfully\n", noteToPush.Title)
		fmt.Printf("ID: %s\n", note.ID)
		if len(note.Tags) > 0 {
			fmt.Printf("Tags: %v\n", strings.Join(note.Tags, ", "))
		}
		return nil
	},
}

func ShouldCreateSnapshot(latestVersion *api.Version) bool {
	nextVersionNumber := latestVersion.Metadata.VersionNumber + 1
	return nextVersionNumber%10 == 0
}

func init() {
	rootCmd.AddCommand(pushCmd)
	pushCmd.Flags().StringP("title", "t", "", "Title of the note to push")
}
