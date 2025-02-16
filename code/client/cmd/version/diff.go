package version

import (
	"bytes"
	"fmt"
	"github.com/fatih/color"
	"github.com/pmezard/go-difflib/difflib"
	"github.com/spf13/cobra"
	"noted/internal/api"
	"noted/internal/auth"
	"noted/internal/encryption"
	"noted/internal/storage"
	"noted/internal/utils"
	"strings"
)

var diffCmd = &cobra.Command{
	Use:   "diff [id]",
	Short: "Show differences between versions, required noted to be unlocked",
	Long: `Show differences between a selected version and its previous version.
Displays changes in a git-like format with context.
Requires noted to be unlocked.`,
	RunE: func(cmd *cobra.Command, args []string) error {
		var noteToCompare *storage.Note
		var err error

		symmetricKey, err := auth.GetSymmetricKey()
		if err != nil {
			return fmt.Errorf("noted is locked, please unlock first: %w", err)
		}

		encryptionService := encryption.NewEncryptionService()

		if len(args) > 0 {
			noteToCompare, err = storage.GetNoteByID(args[0])
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

			noteToCompare, err = storage.SelectNote(title)
			if err != nil {
				return err
			}
		}

		client, err := api.NewClient()
		if err != nil {
			return err
		}

		versions, err := client.GetVersions(noteToCompare.ID)
		if err != nil {
			return fmt.Errorf("failed to get versions: %w", err)
		}
		if len(versions) == 0 {
			return fmt.Errorf("no versions found for note")
		}

		if len(versions) < 2 {
			return fmt.Errorf("need at least two versions to compare")
		}

		selectedVersion, err := utils.SelectVersion(versions)
		if err != nil {
			return err
		}

		var prevVersion *api.Version
		for i, v := range versions {
			if v.ID == selectedVersion.ID && i < len(versions)-1 {
				prevVersion = versions[i+1]
				break
			}
		}

		if prevVersion == nil {
			return fmt.Errorf("no previous version found")
		}

		selectedContent := ""
		prevContent := ""

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
			selectedContent = decryptedContent
		} else {
			chain, err := client.GetVersionChain(noteToCompare.ID, selectedVersion.CreatedAt)
			if err != nil {
				return fmt.Errorf("failed to get version chain: %w", err)
			}
			selectedContent, err = utils.BuildDecryptedVersionContent(chain, encryptionService, symmetricKey)
			if err != nil {
				return fmt.Errorf("failed to build version content: %w", err)
			}
		}

		if prevVersion.Type == "snapshot" {
			decryptedContent, err := encryptionService.DecryptVersionContent(encryption.EncryptedContent{
				Content:   prevVersion.Content,
				ContentIv: prevVersion.ContentIv,
				CipherKey: prevVersion.CipherKey,
				CipherIv:  prevVersion.CipherIv,
			}, symmetricKey)
			if err != nil {
				return fmt.Errorf("failed to decrypt version content: %w", err)
			}
			prevContent = decryptedContent
		} else {
			chain, err := client.GetVersionChain(noteToCompare.ID, prevVersion.CreatedAt)
			if err != nil {
				return fmt.Errorf("failed to get version chain: %w", err)
			}
			prevContent, err = utils.BuildDecryptedVersionContent(chain, encryptionService, symmetricKey)
			if err != nil {
				return fmt.Errorf("failed to build version content: %w", err)
			}
		}

		fmt.Printf("\nDiff between versions:\n")
		fmt.Printf("Version #%d (%s) → Version #%d (%s)\n",
			prevVersion.Metadata.VersionNumber,
			prevVersion.CreatedAt.Format("2006-01-02 15:04:05"),
			selectedVersion.Metadata.VersionNumber,
			selectedVersion.CreatedAt.Format("2006-01-02 15:04:05"),
		)
		fmt.Println(strings.Repeat("-", 80))

		printUnifiedDiff(prevContent, selectedContent)
		return nil
	},
}

func printUnifiedDiff(oldText, newText string) {
	oldLines := difflib.SplitLines(oldText)
	newLines := difflib.SplitLines(newText)

	diff := difflib.UnifiedDiff{
		A:        oldLines,
		B:        newLines,
		FromFile: "Old Version",
		ToFile:   "New Version",
		Context:  3,
		Eol:      "\n",
	}

	var buf bytes.Buffer
	err := difflib.WriteUnifiedDiff(&buf, diff)
	if err != nil {
		color.Red("Error generating diff: %v", err)
		return
	}

	headerColor := color.New(color.FgCyan, color.Bold).SprintFunc()
	hunkColor := color.New(color.FgMagenta).SprintFunc()
	addColor := color.New(color.FgGreen).SprintFunc()
	delColor := color.New(color.FgRed).SprintFunc()
	lineNumColor := color.New(color.FgYellow).SprintFunc()
	separatorColor := color.New(color.FgBlue).SprintFunc()

	oldLineNum := 0
	newLineNum := 0

	leftSep := separatorColor("│")
	rightSep := separatorColor("│")

	for _, line := range strings.Split(buf.String(), "\n") {
		if line == "" {
			continue
		}

		switch {
		case strings.HasPrefix(line, "+++") || strings.HasPrefix(line, "---"):
			fmt.Println(headerColor(line))

		case strings.HasPrefix(line, "@@"):
			var oldStart, oldCount, newStart, newCount int
			_, err := fmt.Sscanf(line, "@@ -%d,%d +%d,%d @@", &oldStart, &oldCount, &newStart, &newCount)
			if err == nil {
				oldLineNum = oldStart - 1
				newLineNum = newStart - 1
			}
			fmt.Println(hunkColor(line))

		case strings.HasPrefix(line, "+"):
			newLineNum++
			fmt.Printf("%5s %s %s %s %s\n",
				"",
				leftSep,
				lineNumColor(fmt.Sprintf("%5d", newLineNum)),
				rightSep,
				addColor(line),
			)

		case strings.HasPrefix(line, "-"):
			oldLineNum++
			fmt.Printf("%s %s %5s %s %s\n",
				lineNumColor(fmt.Sprintf("%5d", oldLineNum)),
				leftSep,
				"",
				rightSep,
				delColor(line),
			)

		default:
			oldLineNum++
			newLineNum++
			fmt.Printf("%s %s %s %s %s\n",
				lineNumColor(fmt.Sprintf("%5d", oldLineNum)),
				leftSep,
				lineNumColor(fmt.Sprintf("%5d", newLineNum)),
				rightSep,
				line,
			)
		}
	}
}

func init() {
	diffCmd.Flags().StringP("title", "t", "", "Title of the note to show diff for")
}
