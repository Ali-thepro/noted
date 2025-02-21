package auth

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetSymmetricKey(t *testing.T) {
	originalKey := os.Getenv("NOTED_KEY")
	defer os.Setenv("NOTED_KEY", originalKey)

	tests := []struct {
		name        string
		envKey      string
		expectError bool
	}{
		{
			name:        "valid key",
			envKey:      "dGVzdGtleXRlc3RrZXk=",
			expectError: false,
		},
		{
			name:        "empty key",
			envKey:      "",
			expectError: true,
		},
		{
			name:        "invalid base64",
			envKey:      "invalid-base64",
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			os.Setenv("NOTED_KEY", tt.envKey)

			key, err := GetSymmetricKey()
			if tt.expectError {
				assert.Error(t, err)
				assert.Nil(t, key)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, key)
				assert.Greater(t, len(key), 0)
			}
		})
	}
}
