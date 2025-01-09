package auth

import (
	"fmt"
	"os/exec"
	"runtime"
	"strings"
)

// https://stackoverflow.com/questions/39320371/how-start-web-server-to-open-page-in-browser-in-golang
func openBrowser(loginURL string) error {
	fmt.Println("Opening browser...")

	var cmd *exec.Cmd

	switch runtime.GOOS {
	case "windows":
		escapedURL := strings.ReplaceAll(loginURL, "&", "^&")
		cmd = exec.Command("cmd.exe", "/c", "start", escapedURL)
	case "darwin":
		cmd = exec.Command("open", loginURL)
	case "linux":
		if isWSL() {
			escapedURL := strings.ReplaceAll(loginURL, "&", "^&")
			cmd = exec.Command("cmd.exe", "/c", "start", escapedURL)
		} else {
			cmd = exec.Command("xdg-open", loginURL)
		}
	default:
		cmd = exec.Command("xdg-open", loginURL)
	}

	return cmd.Start()
}

func isWSL() bool {
	output, err := exec.Command("uname", "-r").Output()
	return err == nil && strings.Contains(strings.ToLower(string(output)), "microsoft")
}
