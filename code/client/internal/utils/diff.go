package utils

import (
	"fmt"
	"github.com/sergi/go-diff/diffmatchpatch"
	"noted/internal/api"
	"noted/internal/encryption"
	"strings"
)

func SelectVersion(versions []*api.Version) (*api.Version, error) {
	fmt.Println("Available versions:")
	fmt.Println()

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
			tagsLen = 4
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

	length := len(versions)
	for i := length - 1; i >= 0; i-- {
		v := versions[i]
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

	var choice int
	fmt.Print("\nChoose a number (1-", length, "): ")
	_, err := fmt.Scanf("%d", &choice)
	if err != nil || choice < 1 || choice > length {
		return nil, fmt.Errorf("invalid selection")
	}

	selectedIndex := length - choice
	return versions[selectedIndex], nil
}

func BuildDecryptedVersionContent(chain []*api.Version, encryptionService *encryption.EncryptionService, symmetricKey []byte) (string, error) {
	if len(chain) == 0 {
		return "", fmt.Errorf("empty version chain")
	}

	baseVersion := chain[0]
	content, err := encryptionService.DecryptVersionContent(encryption.EncryptedContent{
		Content:   baseVersion.Content,
		ContentIv: baseVersion.ContentIv,
		CipherKey: baseVersion.CipherKey,
		CipherIv:  baseVersion.CipherIv,
	}, symmetricKey)
	if err != nil {
		return "", fmt.Errorf("failed to decrypt base version: %w", err)
	}

	dmp := diffmatchpatch.New()

	for i := 1; i < len(chain); i++ {
		version := chain[i]
		if version.Type != "diff" {
			return "", fmt.Errorf("unexpected version type in chain: %s", version.Type)
		}

		decryptedDiff, err := encryptionService.DecryptVersionContent(encryption.EncryptedContent{
			Content:   version.Content,
			ContentIv: version.ContentIv,
			CipherKey: version.CipherKey,
			CipherIv:  version.CipherIv,
		}, symmetricKey)
		if err != nil {
			return "", fmt.Errorf("failed to decrypt diff version #%d: %w", version.Metadata.VersionNumber, err)
		}

		// Convert delta back to diffs
		diffs, err := dmp.DiffFromDelta(content, decryptedDiff)
		if err != nil {
			return "", fmt.Errorf("failed to parse diff delta for version #%d: %w",
				version.Metadata.VersionNumber, err)
		}

		patches := dmp.PatchMake(content, diffs)
		newContent, applied := dmp.PatchApply(patches, content)

		for _, wasApplied := range applied {
			if !wasApplied {
				return "", fmt.Errorf("failed to apply patches for version #%d",
					version.Metadata.VersionNumber)
			}
		}

		content = newContent
	}

	return content, nil
}
