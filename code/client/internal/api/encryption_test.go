package api

import (
	"bytes"
	"io"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSetupEncryption(t *testing.T) {
	tests := []struct {
		name          string
		input         *EncryptionSetupData
		responseCode  int
		responseBody  string
		expectedError bool
	}{
		{
			name: "successful setup",
			input: &EncryptionSetupData{
				MasterPasswordHash:    "hash123",
				ProtectedSymmetricKey: "key123",
				IV:                    "iv123",
			},
			responseCode:  http.StatusOK,
			responseBody:  "{}",
			expectedError: false,
		},
		{
			name:          "unauthorized setup",
			input:         &EncryptionSetupData{},
			responseCode:  http.StatusUnauthorized,
			responseBody:  `{"error": "unauthorized"}`,
			expectedError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			client := &Client{
				baseURL:    "test",
				httpClient: &http.Client{},
			}

			resp := &http.Response{
				StatusCode: tt.responseCode,
				Body:       io.NopCloser(bytes.NewReader([]byte(tt.responseBody))),
			}

			err := client.handleResponse(resp, nil)

			if tt.expectedError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestGetMasterPasswordHash(t *testing.T) {
	tests := []struct {
		name          string
		responseBody  string
		responseCode  int
		expectedHash  string
		expectedError bool
		errorMessage  string
	}{
		{
			name:          "successful hash retrieval",
			responseBody:  `"hash123"`,
			responseCode:  http.StatusOK,
			expectedHash:  "hash123",
			expectedError: false,
		},
		{
			name:          "unauthorized",
			responseBody:  `{"error": "unauthorized"}`,
			responseCode:  http.StatusUnauthorized,
			expectedError: true,
			errorMessage:  "unauthorized",
		},
		{
			name:          "invalid json",
			responseBody:  `{invalid-json`,
			responseCode:  http.StatusOK,
			expectedError: true,
			errorMessage:  "failed to decode response body",
		},
		{
			name:          "empty response",
			responseBody:  ``,
			responseCode:  http.StatusOK,
			expectedError: true,
			errorMessage:  "failed to decode response body",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			client := &Client{
				baseURL:    "test",
				httpClient: &http.Client{},
			}

			resp := &http.Response{
				StatusCode: tt.responseCode,
				Body:       io.NopCloser(bytes.NewReader([]byte(tt.responseBody))),
			}

			var hash string
			err := client.handleResponse(resp, &hash)

			if tt.expectedError {
				assert.Error(t, err)
				if tt.errorMessage != "" {
					assert.Contains(t, err.Error(), tt.errorMessage)
				}
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedHash, hash)
			}
		})
	}
}

func TestGetProtectedSymmetricKey(t *testing.T) {
	tests := []struct {
		name          string
		responseBody  string
		responseCode  int
		expectedError bool
	}{
		{
			name:          "successful key retrieval",
			responseBody:  `"key123"`,
			responseCode:  http.StatusOK,
			expectedError: false,
		},
		{
			name:          "unauthorized",
			responseBody:  `{"error": "unauthorized"}`,
			responseCode:  http.StatusUnauthorized,
			expectedError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			client := &Client{
				baseURL:    "test",
				httpClient: &http.Client{},
			}

			resp := &http.Response{
				StatusCode: tt.responseCode,
				Body:       io.NopCloser(bytes.NewReader([]byte(tt.responseBody))),
			}

			var key string
			err := client.handleResponse(resp, &key)

			if tt.expectedError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, "key123", key)
			}
		})
	}
}

func TestGetIV(t *testing.T) {
	tests := []struct {
		name          string
		responseBody  string
		responseCode  int
		expectedError bool
	}{
		{
			name:          "successful IV retrieval",
			responseBody:  `"iv123"`,
			responseCode:  http.StatusOK,
			expectedError: false,
		},
		{
			name:          "unauthorized",
			responseBody:  `{"error": "unauthorized"}`,
			responseCode:  http.StatusUnauthorized,
			expectedError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			client := &Client{
				baseURL:    "test",
				httpClient: &http.Client{},
			}

			resp := &http.Response{
				StatusCode: tt.responseCode,
				Body:       io.NopCloser(bytes.NewReader([]byte(tt.responseBody))),
			}

			var iv string
			err := client.handleResponse(resp, &iv)

			if tt.expectedError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, "iv123", iv)
			}
		})
	}
}

func TestEncryptionStatus(t *testing.T) {
	tests := []struct {
		name          string
		responseBody  string
		responseCode  int
		expectedError bool
	}{
		{
			name:          "successful status check",
			responseBody:  `true`,
			responseCode:  http.StatusOK,
			expectedError: false,
		},
		{
			name:          "unauthorized",
			responseBody:  `{"error": "unauthorized"}`,
			responseCode:  http.StatusUnauthorized,
			expectedError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			client := &Client{
				baseURL:    "test",
				httpClient: &http.Client{},
			}

			resp := &http.Response{
				StatusCode: tt.responseCode,
				Body:       io.NopCloser(bytes.NewReader([]byte(tt.responseBody))),
			}

			var status bool
			err := client.handleResponse(resp, &status)

			if tt.expectedError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.True(t, status)
			}
		})
	}
}
