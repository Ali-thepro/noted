package auth

import (
	"runtime"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestIsWSL(t *testing.T) {
	// Test WSL detection
	result := IsWSL()
	if runtime.GOOS == "linux" {
		assert.IsType(t, true, result)
	} else {
		assert.False(t, result)
	}
}
