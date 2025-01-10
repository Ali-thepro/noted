package clipboard

import (
	"fmt"
	"os/exec"
	"runtime"
)

// https://go.dev/tour/methods/1
type Manager struct {
	isWSL bool
}

func NewManager(isWSL bool) *Manager {
	return &Manager{
		isWSL: isWSL,
	}
}

func (m *Manager) CopyToClipboard(text string) error {
	var cmd *exec.Cmd

	switch runtime.GOOS {
	case "darwin":
		cmd = exec.Command("pbcopy")
	case "linux":
		if m.isWSL {
			cmd = exec.Command("clip.exe")
		} else {
			cmd = exec.Command("xclip", "-selection", "clipboard")
		}
	case "windows":
		cmd = exec.Command("clip")
	default:
		return fmt.Errorf("unsupported operating system: %s", runtime.GOOS)
	}

	// https://pkg.go.dev/os/exec#Cmd.StdinPipe, https://stackoverflow.com/questions/36382880/go-write-to-stdin-on-external-command
	stdin, err := cmd.StdinPipe()
	if err != nil {
		return fmt.Errorf("failed to create stdin pipe: %w", err)
	}

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to start clipboard command: %w", err)
	}

	if _, err := stdin.Write([]byte(text)); err != nil {
		return fmt.Errorf("failed to write to clipboard: %w", err)
	}

	if err := stdin.Close(); err != nil {
		return fmt.Errorf("failed to close stdin pipe: %w", err)
	}

	if err := cmd.Wait(); err != nil {
		return fmt.Errorf("clipboard command failed: %w", err)
	}

	return nil
}
