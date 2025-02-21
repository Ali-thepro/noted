package api

import (
	"bytes"
	"io"
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestCreateVersion(t *testing.T) {
	tests := []struct {
		name          string
		noteID        string
		request       *CreateVersionRequest
		responseCode  int
		responseBody  string
		expectedError bool
	}{
		{
			name:   "successful create",
			noteID: "123",
			request: &CreateVersionRequest{
				Type:    "update",
				Content: "test content",
				Metadata: VersionMetadata{
					Title: "Test Version",
					Tags:  []string{"test"},
				},
			},
			responseCode:  http.StatusOK,
			responseBody:  `{"id": "v1", "noteId": "123", "type": "update", "content": "test content"}`,
			expectedError: false,
		},
		{
			name:          "unauthorized",
			noteID:        "123",
			request:       &CreateVersionRequest{},
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

			var version Version
			err := client.handleResponse(resp, &version)

			if tt.expectedError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.noteID, version.NoteID)
			}
		})
	}
}

func TestGetVersions(t *testing.T) {
	tests := []struct {
		name          string
		noteID        string
		responseCode  int
		responseBody  string
		expectedError bool
		expectedCount int
	}{
		{
			name:          "successful fetch",
			noteID:        "123",
			responseCode:  http.StatusOK,
			responseBody:  `[{"id": "v1", "noteId": "123"}, {"id": "v2", "noteId": "123"}]`,
			expectedError: false,
			expectedCount: 2,
		},
		{
			name:          "empty result",
			noteID:        "123",
			responseCode:  http.StatusOK,
			responseBody:  `[]`,
			expectedError: false,
			expectedCount: 0,
		},
		{
			name:          "unauthorized",
			noteID:        "123",
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

			var versions []*Version
			err := client.handleResponse(resp, &versions)

			if tt.expectedError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedCount, len(versions))
				if tt.expectedCount > 0 {
					assert.Equal(t, tt.noteID, versions[0].NoteID)
				}
			}
		})
	}
}

func TestGetVersionChain(t *testing.T) {
	tests := []struct {
		name          string
		noteID        string
		until         time.Time
		responseCode  int
		responseBody  string
		expectedError bool
		expectedCount int
	}{
		{
			name:          "successful chain fetch",
			noteID:        "123",
			until:         time.Now(),
			responseCode:  http.StatusOK,
			responseBody:  `[{"id": "v1", "noteId": "123"}, {"id": "v2", "noteId": "123"}]`,
			expectedError: false,
			expectedCount: 2,
		},
		{
			name:          "empty chain",
			noteID:        "123",
			until:         time.Time{},
			responseCode:  http.StatusOK,
			responseBody:  `[]`,
			expectedError: false,
			expectedCount: 0,
		},
		{
			name:          "unauthorized",
			noteID:        "123",
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

			var versions []*Version
			err := client.handleResponse(resp, &versions)

			if tt.expectedError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedCount, len(versions))
				if tt.expectedCount > 0 {
					assert.Equal(t, tt.noteID, versions[0].NoteID)
				}
			}
		})
	}
}
