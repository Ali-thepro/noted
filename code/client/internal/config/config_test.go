package config

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLoadAndSaveConfig(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "config-test")
	assert.NoError(t, err)
	defer os.RemoveAll(tmpDir)

	tests := []struct {
		name          string
		config        *Config
		expectedError bool
	}{
		{
			name: "valid config",
			config: &Config{
				APIURL: "http://test.com/api",
				Theme:  "dark",
			},
			expectedError: false,
		},
		{
			name: "valid config with auto theme",
			config: &Config{
				APIURL: "http://test.com/api",
				Theme:  "auto",
			},
			expectedError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := SaveConfig(tt.config)
			if tt.expectedError {
				assert.Error(t, err)
				return
			}
			assert.NoError(t, err)

			loaded, err := LoadConfig()
			assert.NoError(t, err)
			assert.Equal(t, tt.config.APIURL, loaded.APIURL)
			assert.Equal(t, tt.config.Theme, loaded.Theme)
		})
	}
}

func TestIsValidTheme(t *testing.T) {
	tests := []struct {
		name     string
		theme    string
		expected bool
	}{
		{
			name:     "auto theme",
			theme:    "auto",
			expected: true,
		},
		{
			name:     "dark theme",
			theme:    "dark",
			expected: true,
		},
		{
			name:     "light theme",
			theme:    "light",
			expected: true,
		},
		{
			name:     "invalid theme",
			theme:    "invalid",
			expected: false,
		},
		{
			name:     "empty theme",
			theme:    "",
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := IsValidTheme(tt.theme)
			assert.Equal(t, tt.expected, result)
		})
	}
}
