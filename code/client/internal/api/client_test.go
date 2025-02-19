package api

import (
	"bytes"
	"io"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewClient(t *testing.T) {
	client, err := NewClient()
	assert.NoError(t, err)
	assert.NotNil(t, client)
	assert.NotEmpty(t, client.baseURL)
}

func TestHandleResponse(t *testing.T) {
	tests := []struct {
		name          string
		response      *http.Response
		result        interface{}
		expectedError bool
	}{
		{
			name: "unauthorized response",
			response: &http.Response{
				StatusCode: http.StatusUnauthorized,
				Body:       io.NopCloser(bytes.NewReader([]byte(`{"error": "unauthorized"}`))),
			},
			expectedError: true,
		},
		{
			name: "not found response",
			response: &http.Response{
				StatusCode: http.StatusNotFound,
				Request:    &http.Request{Method: "GET"},
				Body:       io.NopCloser(bytes.NewReader([]byte(`{}`))),
			},
			expectedError: true,
		},
		{
			name: "successful response",
			response: &http.Response{
				StatusCode: http.StatusOK,
				Body:       io.NopCloser(bytes.NewReader([]byte(`{}`))),
			},
			expectedError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			client := &Client{
				baseURL:    "test",
				httpClient: &http.Client{},
			}

			err := client.handleResponse(tt.response, tt.result)

			if tt.expectedError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}
