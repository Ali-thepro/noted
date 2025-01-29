package version

import (
	"fmt"
	"noted/internal/api"

	"github.com/sergi/go-diff/diffmatchpatch"
)

func selectVersion(versions []*api.Version) (*api.Version, error) {
	fmt.Println("Available versions:")
	length := len(versions)
	for i := length - 1; i >= 0; i-- {
		v := versions[i]
		displayIndex := length - i
		fmt.Printf("%d. Version #%d (%s) - %s\n",
			displayIndex,
			v.Metadata.VersionNumber,
			v.CreatedAt.Format("2006-01-02 15:04:05"),
			v.Type,
		)
	}

	var choice int
	fmt.Print("\nChoose a number: ")
	_, err := fmt.Scanf("%d", &choice)
	if err != nil || choice < 1 || choice > length {
		return nil, fmt.Errorf("invalid selection")
	}

	selectedIndex := length - choice
	return versions[selectedIndex], nil
}

func BuildVersionContent(chain []*api.Version) string {
	if len(chain) == 0 {
		return ""
	}

	if chain[0].Type != "snapshot" {
		fmt.Printf("Warning: Chain doesn't start with snapshot (starts with %s)\n", chain[0].Type)
		return ""
	}

	dmp := diffmatchpatch.New()
	content := chain[0].Content

	for i := 1; i < len(chain); i++ {
		version := chain[i]
		if version.Type != "diff" {
			fmt.Printf("Warning: Unexpected version type in chain: %s\n", version.Type)
			continue
		}

		// Convert delta back to diffs
		diffs, err := dmp.DiffFromDelta(content, version.Content)
		if err != nil {
			fmt.Printf("Warning: Failed to parse diff delta for version #%d: %v\n",
				version.Metadata.VersionNumber, err)
			continue
		}

		patches := dmp.PatchMake(content, diffs)
		newContent, applied := dmp.PatchApply(patches, content)

		allApplied := true
		for _, wasApplied := range applied {
			if !wasApplied {
				allApplied = false
				break
			}
		}

		if !allApplied {
			fmt.Printf("Warning: Some patches failed to apply for version #%d\n",
				version.Metadata.VersionNumber)
			continue
		}

		content = newContent
	}

	return content
}
