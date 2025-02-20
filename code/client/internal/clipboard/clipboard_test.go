package clipboard

import (
	"os/exec"
	"runtime"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewManager(t *testing.T) {
	manager := NewManager(false)
	assert.NotNil(t, manager)
	assert.False(t, manager.isWSL)

	manager = NewManager(true)
	assert.NotNil(t, manager)
	assert.True(t, manager.isWSL)
}

func TestCopyToClipboard(t *testing.T) {
	tests := []struct {
		name          string
		text          string
		isWSL         bool
		expectedError bool
	}{
		{
			name:          "empty text",
			text:          "",
			isWSL:         false,
			expectedError: false,
		},
		{
			name:          "simple text",
			text:          "test",
			isWSL:         false,
			expectedError: false,
		},
		{
			name:          "wsl mode",
			text:          "test",
			isWSL:         true,
			expectedError: runtime.GOOS != "linux", // Should only work on Linux
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			manager := NewManager(tt.isWSL)
			err := manager.CopyToClipboard(tt.text)

			if tt.expectedError {
				assert.Error(t, err)
			} else {
				if runtime.GOOS == "darwin" || runtime.GOOS == "windows" ||
					(runtime.GOOS == "linux" && ((tt.isWSL && commandExists("clip.exe")) ||
						(!tt.isWSL && commandExists("xclip")))) {
					assert.NoError(t, err)
				} else {
					assert.Error(t, err)
				}
			}
		})
	}
}

func commandExists(cmd string) bool {
	_, err := exec.LookPath(cmd)
	return err == nil
}
