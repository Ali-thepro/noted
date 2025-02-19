package api

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetMe(t *testing.T) {
	tests := []struct {
		name          string
		responseBody  *UserResponse
		responseCode  int
		expectedError bool
	}{
		{
			name: "successful response",
			responseBody: &UserResponse{
				Username: "testuser",
				Email:    "test@example.com",
				OAuth:    true,
				Provider: "github",
				ID:       "123",
			},
			responseCode:  http.StatusOK,
			expectedError: false,
		},
		{
			name:          "unauthorized response",
			responseBody:  nil,
			responseCode:  http.StatusUnauthorized,
			expectedError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create response body
			var respBody []byte
			if tt.responseBody != nil {
				respBody, _ = json.Marshal(tt.responseBody)
			} else {
				respBody = []byte(`{"error": "unauthorized"}`)
			}

			client := &Client{
				baseURL:    "test",
				httpClient: &http.Client{},
			}

			// Create test response
			resp := &http.Response{
				StatusCode: tt.responseCode,
				Body:       io.NopCloser(bytes.NewReader(respBody)),
			}

			err := client.handleResponse(resp, tt.responseBody)

			if tt.expectedError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.responseBody.Username, "testuser")
				assert.Equal(t, tt.responseBody.Email, "test@example.com")
				assert.Equal(t, tt.responseBody.OAuth, true)
				assert.Equal(t, tt.responseBody.Provider, "github")
				assert.Equal(t, tt.responseBody.ID, "123")
			}
		})
	}
}
