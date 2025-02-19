package cmd

import (
	"fmt"
	"github.com/spf13/cobra"
	"noted/internal/api"
	"noted/internal/auth"
	"noted/internal/encryption"
	"noted/internal/storage"
	"noted/internal/utils"
	"strings"
)

var pushCmd = &cobra.Command{
	Use:   "push [id]",
	Short: "Push note changes to server, requires noted to be unlocked",
	Long: `Push note changes to the server. 
You can specify either the note ID as an argument or use --title flag.
Requires noted to be unlocked.`,
	RunE: func(cmd *cobra.Command, args []string) error {
		var noteToPush *storage.Note
		var err error

		symmetricKey, err := auth.GetSymmetricKey()
		if err != nil {
			return fmt.Errorf("noted is locked, please unlock first: %w", err)
		}

		encryptionService := encryption.NewEncryptionService()

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

		note, err := client.GetNote(noteToPush.ID)
		if err != nil {
			return fmt.Errorf("failed to get note: %w", err)
		}

		noteCipherKey, err := encryptionService.UnwrapNoteCipherKey(note.CipherKey, note.CipherIv, symmetricKey)
		if err != nil {
			return fmt.Errorf("failed to unwrap note cipher key: %w", err)
		}

		encryptedNoteContent, iv, err := encryptionService.EncryptNoteContent(content, noteCipherKey)
		if err != nil {
			return fmt.Errorf("failed to encrypt note content: %w", err)
		}

		updatedNote, err := client.UpdateNote(noteToPush.ID, api.UpdateNoteRequest{
			Title:     noteToPush.Title,
			Tags:      noteToPush.Tags,
			Content:   encryptedNoteContent,
			ContentIv: iv,
			CipherKey: note.CipherKey,
			CipherIv:  note.CipherIv,
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
			decryptedContent, err := encryptionService.DecryptVersionContent(encryption.EncryptedContent{
				Content:   latestVersion.Content,
				ContentIv: latestVersion.ContentIv,
				CipherKey: latestVersion.CipherKey,
				CipherIv:  latestVersion.CipherIv,
			}, symmetricKey)
			if err != nil {
				return fmt.Errorf("failed to decrypt latest version: %w", err)
			}
			baseContent = decryptedContent
		} else {
			chain, err := client.GetVersionChain(noteToPush.ID, latestVersion.CreatedAt)
			if err != nil {
				return fmt.Errorf("failed to get version chain: %w", err)
			}
			baseContent, err = utils.BuildDecryptedVersionContent(chain, encryptionService, symmetricKey)
			if err != nil {
				return fmt.Errorf("failed to build version content: %w", err)
			}
		}

		if baseContent == content {
			fmt.Println("No changes detected. Nothing to push.")
			return nil
		}

		versionType := "diff"
		var encryptedVersion *encryption.EncryptedContent
		var baseVersion string

		if ShouldCreateSnapshot(latestVersion) {
			versionType = "snapshot"
			encryptedContent, iv, err := encryptionService.EncryptNoteContent(content, noteCipherKey)
			if err != nil {
				return fmt.Errorf("failed to encrypt snapshot: %w", err)
			}
			encryptedVersion = &encryption.EncryptedContent{
				Content:   encryptedContent,
				ContentIv: iv,
				CipherKey: updatedNote.CipherKey,
				CipherIv:  updatedNote.CipherIv,
			}
		} else {
			encryptedVersion, err = encryptionService.CreateEncryptedDiff(baseContent, content, encryption.NoteKeys{
				CipherKey: updatedNote.CipherKey,
				CipherIv:  updatedNote.CipherIv,
			}, symmetricKey)
			if err != nil {
				return fmt.Errorf("failed to create encrypted diff: %w", err)
			}
			baseVersion = latestVersion.ID
		}

		_, err = client.CreateVersion(noteToPush.ID, &api.CreateVersionRequest{
			Type:        versionType,
			Content:     encryptedVersion.Content,
			ContentIv:   encryptedVersion.ContentIv,
			CipherKey:   encryptedVersion.CipherKey,
			CipherIv:    encryptedVersion.CipherIv,
			BaseVersion: baseVersion,
			Metadata: api.VersionMetadata{
				Title:         updatedNote.Title,
				Tags:          updatedNote.Tags,
				VersionNumber: latestVersion.Metadata.VersionNumber + 1,
			},
		})
		if err != nil {
			return fmt.Errorf("failed to create version: %w", err)
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
