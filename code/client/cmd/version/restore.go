package version

import (
	"fmt"
	"noted/internal/api"
	"noted/internal/storage"
	"strconv"

	"github.com/spf13/cobra"
)

var restoreCmd = &cobra.Command{
	Use:   "restore [id] [version-number]",
	Short: "Restore a note to a specific version",
	Long:  `Restore a note to a specific version. If version number is not provided, you will be prompted to select one.`,
	RunE: func(cmd *cobra.Command, args []string) error {
		var noteToRestore *storage.Note
		var err error

		if len(args) > 0 {
			noteToRestore, err = storage.GetNoteByID(args[0])
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

			noteToRestore, err = storage.SelectNote(title)
			if err != nil {
				return err
			}
		}

		client, err := api.NewClient()
		if err != nil {
			return err
		}

		versions, err := client.GetVersions(noteToRestore.ID)
		if err != nil {
			return fmt.Errorf("failed to get versions: %w", err)
		}

		if len(versions) == 0 {
			return fmt.Errorf("no versions found for note")
		}

		var selectedVersion *api.Version

		if len(args) > 1 {
			versionNum, err := strconv.Atoi(args[1])
			if err != nil {
				return fmt.Errorf("invalid version number: %s", args[1])
			}

			for _, v := range versions {
				if v.Metadata.VersionNumber == versionNum {
					selectedVersion = v
					break
				}
			}
			if selectedVersion == nil {
				return fmt.Errorf("version %d not found", versionNum)
			}
		} else {
			selectedVersion, err = selectVersion(versions)
			if err != nil {
				return err
			}
		}

		var content string
		if selectedVersion.Type == "diff" {
			chain, err := client.GetVersionChain(noteToRestore.ID, selectedVersion.CreatedAt)
			if err != nil {
				return fmt.Errorf("failed to get version chain: %w", err)
			}
			content = BuildVersionContent(chain)
		} else {
			content = selectedVersion.Content
		}

		if err := storage.WriteNoteContent(noteToRestore.Filename, content); err != nil {
			return fmt.Errorf("failed to write note content: %w", err)
		}

		note, err := client.UpdateNote(noteToRestore.ID, api.UpdateNoteRequest{
			Title:   selectedVersion.Metadata.Title,
			Tags:    selectedVersion.Metadata.Tags,
			Content: content,
		})
		if err != nil {
			return fmt.Errorf("failed to update note on server: %w", err)
		}

		_, err = client.CreateVersion(noteToRestore.ID, &api.CreateVersionRequest{
			Type:    "snapshot", // Always create snapshot for restore
			Content: content,
			Metadata: api.VersionMetadata{
				Title:         noteToRestore.Title,
				Tags:          noteToRestore.Tags,
				VersionNumber: versions[0].Metadata.VersionNumber + 1,
			},
		})
		if err != nil {
			return fmt.Errorf("failed to create restore version: %w", err)
		}

		if err := storage.UpdateNote(note); err != nil {
			return fmt.Errorf("failed to update local note data: %w", err)
		}

		fmt.Printf("Note restored to version #%d successfully\n", selectedVersion.Metadata.VersionNumber)
		return nil
	},
}

func init() {
	restoreCmd.Flags().StringP("title", "t", "", "Title of the note to restore version for")
}
