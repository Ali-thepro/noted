package config

import (
	"fmt"
	"os"
	"os/exec"
	"runtime"
)

func GetDefaultEditor() string {
	if editor := os.Getenv("EDITOR"); editor != "" {
		return editor
	}

	if editor := os.Getenv("VISUAL"); editor != "" {
		return editor
	}

	switch runtime.GOOS {
	case "windows":
		return "notepad"
	default:
		editors := []string{"nano", "vim", "vi"}
		for _, editor := range editors {
			if _, err := exec.LookPath(editor); err == nil {
				return editor
			}
		}
	}

	return "nano"
}

func OpenInEditor(filepath string) error {
	editor := GetDefaultEditor()

	cmd := exec.Command(editor, filepath)
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to open editor: %w", err)
	}

	return nil
}
