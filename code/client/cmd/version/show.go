package version

import (
	"fmt"
	"github.com/charmbracelet/glamour"
	"github.com/spf13/cobra"
	"noted/internal/api"
	"noted/internal/auth"
	"noted/internal/config"
	"noted/internal/encryption"
	"noted/internal/storage"
	"noted/internal/utils"
	"strconv"
)

var showCmd = &cobra.Command{
	Use:   "show [id] [version-number]",
	Short: "Show a specific version of a note, required noted to be unlocked",
	Long: `Show a specific version of a note. If version number is not provided, you will be prompted to select one.
Requires noted to be unlocked.`,
	RunE: func(cmd *cobra.Command, args []string) error {
		var noteToShow *storage.Note
		var err error

		symmetricKey, err := auth.GetSymmetricKey()
		if err != nil {
			return fmt.Errorf("noted is locked, please unlock first: %w", err)
		}

		encryptionService := encryption.NewEncryptionService()

		if len(args) > 0 {
			noteToShow, err = storage.GetNoteByID(args[0])
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

			noteToShow, err = storage.SelectNote(title)
			if err != nil {
				return err
			}
		}

		client, err := api.NewClient()
		if err != nil {
			return err
		}

		versions, err := client.GetVersions(noteToShow.ID)
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
			chain, err := client.GetVersionChain(noteToShow.ID, selectedVersion.CreatedAt)
			if err != nil {
				return fmt.Errorf("failed to get version chain: %w", err)
			}
			content, err = utils.BuildDecryptedVersionContent(chain, encryptionService, symmetricKey)
			if err != nil {
				return fmt.Errorf("failed to build version content: %w", err)
			}
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

		fmt.Printf("Version #%d (%s) of \"%s\"\n\n",
			selectedVersion.Metadata.VersionNumber,
			selectedVersion.CreatedAt.Format("2006-01-02 15:04:05"),
			noteToShow.Title,
		)
		fmt.Print(rendered)

		return nil
	},
}

func init() {
	showCmd.Flags().StringP("title", "t", "", "Title of the note to show version for")
}
