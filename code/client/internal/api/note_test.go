package api

import (
	"bytes"
	"io"
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestSearchNotes(t *testing.T) {
	tests := []struct {
		name          string
		search        string
		tag           string
		responseCode  int
		responseBody  string
		expectedError bool
		expectedNotes int
	}{
		{
			name:          "successful search",
			search:        "test",
			tag:           "important",
			responseCode:  http.StatusOK,
			responseBody:  `{"notes": [{"id": "1", "title": "test"}], "total": 1}`,
			expectedError: false,
			expectedNotes: 1,
		},
		{
			name:          "empty search",
			search:        "",
			tag:           "",
			responseCode:  http.StatusOK,
			responseBody:  `{"notes": [], "total": 0}`,
			expectedError: false,
			expectedNotes: 0,
		},
		{
			name:          "unauthorized",
			search:        "test",
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

			var result SearchResponse
			err := client.handleResponse(resp, &result)

			if tt.expectedError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedNotes, len(result.Notes))
			}
		})
	}
}

func TestGetNoteMetadata(t *testing.T) {
	tests := []struct {
		name          string
		since         time.Time
		responseCode  int
		responseBody  string
		expectedError bool
		expectedCount int
	}{
		{
			name:          "successful metadata fetch",
			since:         time.Now().Add(-24 * time.Hour),
			responseCode:  http.StatusOK,
			responseBody:  `[{"id": "1", "title": "Note 1"}, {"id": "2", "title": "Note 2"}]`,
			expectedError: false,
			expectedCount: 2,
		},
		{
			name:          "empty result",
			since:         time.Now(),
			responseCode:  http.StatusOK,
			responseBody:  `[]`,
			expectedError: false,
			expectedCount: 0,
		},
		{
			name:          "unauthorized",
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

			var metadata []*NoteMetadata
			err := client.handleResponse(resp, &metadata)

			if tt.expectedError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedCount, len(metadata))
			}
		})
	}
}

func TestGetDeletedNotes(t *testing.T) {
	tests := []struct {
		name          string
		since         time.Time
		responseCode  int
		responseBody  string
		expectedError bool
		expectedCount int
	}{
		{
			name:          "successful deleted notes fetch",
			since:         time.Now().Add(-24 * time.Hour),
			responseCode:  http.StatusOK,
			responseBody:  `[{"noteId": "1", "deletedAt": "2024-01-01T00:00:00Z"}, {"noteId": "2", "deletedAt": "2024-01-02T00:00:00Z"}]`,
			expectedError: false,
			expectedCount: 2,
		},
		{
			name:          "empty result",
			since:         time.Now(),
			responseCode:  http.StatusOK,
			responseBody:  `[]`,
			expectedError: false,
			expectedCount: 0,
		},
		{
			name:          "unauthorized",
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

			var deletedNotes []*DeletedNote
			err := client.handleResponse(resp, &deletedNotes)

			if tt.expectedError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedCount, len(deletedNotes))
			}
		})
	}
}

func TestGetBulkNotes(t *testing.T) {
	tests := []struct {
		name          string
		ids           []string
		responseCode  int
		responseBody  string
		expectedError bool
		expectedCount int
	}{
		{
			name:          "successful bulk fetch",
			ids:           []string{"1", "2"},
			responseCode:  http.StatusOK,
			responseBody:  `[{"id": "1", "title": "Note 1"}, {"id": "2", "title": "Note 2"}]`,
			expectedError: false,
			expectedCount: 2,
		},
		{
			name:          "empty result",
			ids:           []string{},
			responseCode:  http.StatusOK,
			responseBody:  `[]`,
			expectedError: false,
			expectedCount: 0,
		},
		{
			name:          "unauthorized",
			ids:           []string{"1"},
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

			var notes []*Note
			err := client.handleResponse(resp, &notes)

			if tt.expectedError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedCount, len(notes))
			}
		})
	}
}
