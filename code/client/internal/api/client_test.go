package api

import (
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestClient_GetMe(t *testing.T) {
	// Test cases
	tests := []struct {
		name           string
		serverResponse *UserResponse
		serverStatus   int
		wantError      bool
	}{
		{
			name: "successful response",
			serverResponse: &UserResponse{
				Username: "testuser",
				Email:    "test@example.com",
				OAuth:    false,
				Provider: "local",
				ID:       "123",
			},
			serverStatus: http.StatusOK,
			wantError:    false,
		},
		{
			name:         "unauthorized response",
			serverStatus: http.StatusUnauthorized,
			wantError:    true,
		},
		{
			name:         "server error",
			serverStatus: http.StatusInternalServerError,
			wantError:    true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create a test server
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				// Check request method and path
				if r.Method != "GET" || r.URL.Path != "/auth/me" {
					t.Errorf("unexpected request: %s %s", r.Method, r.URL.Path)
				}

				// Check authorization header
				authHeader := r.Header.Get("Authorization")
				if !isValidAuthHeader(authHeader) {
					t.Error("missing or invalid authorization header")
				}

				// Send response
				w.WriteHeader(tt.serverStatus)
				if tt.serverResponse != nil {
					json.NewEncoder(w).Encode(tt.serverResponse) //nolint:errcheck
				}
			}))
			defer server.Close()

			// Create client with test server URL
			// client := &Client{
			// 	baseURL:    server.URL,
			// 	httpClient: http.DefaultClient,
			// }	

			// Call GetMe
			// user, err := client.GetMe()
		})
	}
}

// Helper function to validate auth header
func isValidAuthHeader(header string) bool {
	return len(header) > 7 && header[:7] == "Bearer "
}

func TestClient_handleResponse(t *testing.T) {
	tests := []struct {
		name       string
		statusCode int
		body       string
		wantError  bool
	}{
		{
			name:       "successful response",
			statusCode: http.StatusOK,
			body:       `{"key": "value"}`,
			wantError:  false,
		},
		{
			name:       "error response",
			statusCode: http.StatusBadRequest,
			body:       `{"error": "test error"}`,
			wantError:  true,
		},
		{
			name:       "invalid json",
			statusCode: http.StatusOK,
			body:       `invalid json`,
			wantError:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create response
			resp := &http.Response{
				StatusCode: tt.statusCode,
				Body:       io.NopCloser(strings.NewReader(tt.body)),
			}

			client := &Client{}
			var result map[string]interface{}

			err := client.handleResponse(resp, &result)
			if (err != nil) != tt.wantError {
				t.Errorf("handleResponse() error = %v, wantError %v", err, tt.wantError)
			}
		})
	}
}
