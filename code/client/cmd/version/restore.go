package version

import (
	"fmt"
	"github.com/spf13/cobra"
	"noted/internal/api"
	"noted/internal/auth"
	"noted/internal/encryption"
	"noted/internal/storage"
	"noted/internal/utils"
	"strconv"
)

var restoreCmd = &cobra.Command{
	Use:   "restore [id] [version-number]",
	Short: "Restore a note to a specific version, required noted to be unlocked",
	Long: `Restore a note to a specific version. If version number is not provided, you will be prompted to select one.
Requires noted to be unlocked.`,
	RunE: func(cmd *cobra.Command, args []string) error {
		var noteToRestore *storage.Note
		var err error

		symmetricKey, err := auth.GetSymmetricKey()
		if err != nil {
			return fmt.Errorf("noted is locked, please unlock first: %w", err)
		}

		encryptionService := encryption.NewEncryptionService()

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
			selectedVersion, err = utils.SelectVersion(versions)
			if err != nil {
				return err
			}
		}

		note, err := client.GetNote(noteToRestore.ID)
		if err != nil {
			return fmt.Errorf("failed to get note: %w", err)
		}

		var content string
		if selectedVersion.Type == "snapshot" {
			decryptedContent, err := encryptionService.DecryptVersionContent(encryption.EncryptedContent{
				Content:   selectedVersion.Content,
				ContentIv: selectedVersion.ContentIv,
				CipherKey: selectedVersion.CipherKey,
				CipherIv:  selectedVersion.CipherIv,
			}, symmetricKey)
			if err != nil {
				return fmt.Errorf("failed to decrypt version content: %w", err)
			}
			content = decryptedContent
		} else {
			chain, err := client.GetVersionChain(noteToRestore.ID, selectedVersion.CreatedAt)
			if err != nil {
				return fmt.Errorf("failed to get version chain: %w", err)
			}
			content, err = utils.BuildDecryptedVersionContent(chain, encryptionService, symmetricKey)
			if err != nil {
				return fmt.Errorf("failed to build version content: %w", err)
			}
		}

		currentContent, err := storage.ReadNoteContent(noteToRestore.Filename)
		if err != nil {
			return fmt.Errorf("failed to read current note content: %w", err)
		}

		if noteToRestore.Title == selectedVersion.Metadata.Title && currentContent == content && utils.StringSliceEqual(noteToRestore.Tags, selectedVersion.Metadata.Tags) {
			fmt.Println("Note is already at this version, no restoring needed")
			return nil
		}

		noteCipherKey, err := encryptionService.UnwrapNoteCipherKey(note.CipherKey, note.CipherIv, symmetricKey)
		if err != nil {
			return fmt.Errorf("failed to unwrap note cipher key: %w", err)
		}

		encryptedContent, iv, err := encryptionService.EncryptNoteContent(content, noteCipherKey)
		if err != nil {
			return fmt.Errorf("failed to encrypt restored content: %w", err)
		}
		encryptedVersion := &encryption.EncryptedContent{
			Content:   encryptedContent,
			ContentIv: iv,
			CipherKey: note.CipherKey,
			CipherIv:  note.CipherIv,
		}

		updatedNote, err := client.UpdateNote(noteToRestore.ID, api.UpdateNoteRequest{
			Title:     selectedVersion.Metadata.Title,
			Tags:      selectedVersion.Metadata.Tags,
			Content:   encryptedContent,
			ContentIv: iv,
			CipherKey: note.CipherKey,
			CipherIv:  note.CipherIv,
		})
		if err != nil {
			return fmt.Errorf("failed to update note on server: %w", err)
		}

		newFilename, err := storage.UpdateNoteMetadata(noteToRestore, updatedNote)
		if err != nil {
			return fmt.Errorf("failed to update local note metadata: %w", err)
		}

		if err := storage.WriteNoteContent(newFilename, content); err != nil {
			return fmt.Errorf("failed to write note content: %w", err)
		}

		_, err = client.CreateVersion(noteToRestore.ID, &api.CreateVersionRequest{
			Type:      "snapshot",
			Content:   encryptedVersion.Content,
			ContentIv: encryptedVersion.ContentIv,
			CipherKey: encryptedVersion.CipherKey,
			CipherIv:  encryptedVersion.CipherIv,
			Metadata: api.VersionMetadata{
				Title:         selectedVersion.Metadata.Title,
				Tags:          selectedVersion.Metadata.Tags,
				VersionNumber: versions[0].Metadata.VersionNumber + 1,
			},
		})
		if err != nil {
			return fmt.Errorf("failed to create restore version: %w", err)
		}

		fmt.Printf("Note restored to version #%d successfully\n", selectedVersion.Metadata.VersionNumber)
		return nil
	},
}

func init() {
	restoreCmd.Flags().StringP("title", "t", "", "Title of the note to restore version for")
}
