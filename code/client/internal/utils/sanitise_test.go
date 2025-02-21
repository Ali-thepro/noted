package utils

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSanitiseTitle(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "simple title",
			input:    "Hello World",
			expected: "hello-world",
		},
		{
			name:     "title with special characters",
			input:    "Hello! World? #123",
			expected: "hello-world-123",
		},
		{
			name:     "title with multiple spaces",
			input:    "Hello   World",
			expected: "hello-world",
		},
		{
			name:     "title with leading/trailing hyphens",
			input:    "-Hello World-",
			expected: "hello-world",
		},
		{
			name:     "title with multiple hyphens",
			input:    "Hello---World",
			expected: "hello-world",
		},
		{
			name:     "empty title",
			input:    "",
			expected: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := SanitiseTitle(tt.input)
			assert.Equal(t, tt.expected, result)
		})
	}
}
