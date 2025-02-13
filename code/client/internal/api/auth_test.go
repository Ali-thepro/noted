package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestGetMe(t *testing.T) {
	tests := []struct {
		name           string
		serverResponse *UserResponse
		serverStatus   int
		expectError    bool
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
			expectError:  false,
		},
		{
			name:         "unauthorized",
			serverStatus: http.StatusUnauthorized,
			expectError:  true,
		},
		{
			name:         "server error",
			serverStatus: http.StatusInternalServerError,
			expectError:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create test server
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				// Verify request method and path
				if r.Method != "GET" {
					t.Errorf("expected GET request, got %s", r.Method)
				}
				if r.URL.Path != "/auth/me" {
					t.Errorf("expected /auth/me path, got %s", r.URL.Path)
				}

				// Set response status
				w.WriteHeader(tt.serverStatus)

				// Write response body if successful case
				if tt.serverResponse != nil {
					json.NewEncoder(w).Encode(tt.serverResponse)
				}
			}))
			defer server.Close()

			// Create client pointing to test server
			client := &Client{
				baseURL:    server.URL,
				httpClient: server.Client(),
			}

			// Make request
			user, err := client.GetMe()

			// Check error expectation
			if tt.expectError && err == nil {
				t.Error("expected error but got none")
			}
			if !tt.expectError && err != nil {
				t.Errorf("unexpected error: %v", err)
			}

			// For successful cases, verify response
			if tt.serverResponse != nil && user != nil {
				if user.Username != tt.serverResponse.Username {
					t.Errorf("expected username %s, got %s", tt.serverResponse.Username, user.Username)
				}
				if user.Email != tt.serverResponse.Email {
					t.Errorf("expected email %s, got %s", tt.serverResponse.Email, user.Email)
				}
				if user.OAuth != tt.serverResponse.OAuth {
					t.Errorf("expected OAuth %v, got %v", tt.serverResponse.OAuth, user.OAuth)
				}
				if user.Provider != tt.serverResponse.Provider {
					t.Errorf("expected provider %s, got %s", tt.serverResponse.Provider, user.Provider)
				}
				if user.ID != tt.serverResponse.ID {
					t.Errorf("expected ID %s, got %s", tt.serverResponse.ID, user.ID)
				}
			}
		})
	}
}
