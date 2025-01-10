package api

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"net/http"
	"noted/internal/config"
	"noted/internal/token"
)

// https://stackoverflow.com/questions/17156371/how-to-get-json-response-from-http-get
type UserResponse struct {
	Username string `json:"usernmae"`
	Email    string `json:"email"`
	OAuth    bool   `json:"oauth"`
	Provider string `json:"provider"`
	Id       string `json:"id"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

func GetMe() error {
	cfg := config.NewConfig()
	url := fmt.Sprintf("%s/auth/me", cfg.APIURL)
	tokenStr, err := token.Load()
	if err != nil {
		return fmt.Errorf("failed to load token - please login again: %w", err)
	}
	// https://www.digitalocean.com/community/tutorials/how-to-make-http-requests-in-go
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	// https://stackoverflow.com/questions/51452148/how-can-i-make-a-request-with-a-bearer-token-in-go
	req.Header.Add("Authorization", "Bearer "+tokenStr)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	// https://www.golangprograms.com/how-do-you-handle-http-errors-in-go.html
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response body: %w", err)
	}

	switch resp.StatusCode {
	case http.StatusOK:
		var user UserResponse
		if err := json.Unmarshal(body, &user); err != nil {
			return fmt.Errorf("failed to decode response body: %w", err)
		}

		fmt.Printf("User details:\n")
		fmt.Printf("  Username: %s\n", user.Username)
		fmt.Printf("  Email: %s\n", user.Email)
		fmt.Printf("  OAuth: %t\n", user.OAuth)
		fmt.Printf("  Provider: %s\n", user.Provider)
		fmt.Printf("  Id: %s\n", user.Id)

	case http.StatusUnauthorized:
		var errResponse ErrorResponse
		if err := json.Unmarshal(body, &errResponse); err != nil {
			return fmt.Errorf("failed to parse error response: %w", err)
		}

		fmt.Println("Error:", errResponse.Error)
		fmt.Println("Your session has expired. Please login again.")

		os.Exit(1)
	
	default:
        var errorResp ErrorResponse
        if err := json.Unmarshal(body, &errorResp); err != nil {
            return fmt.Errorf("unexpected status code %d and failed to parse error message: %w", resp.StatusCode, err)
        }
        return fmt.Errorf("server returned status %d: %s", resp.StatusCode, errorResp.Error)
	}

	return nil
}
