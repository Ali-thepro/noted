package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"noted/internal/config"
	"noted/internal/token"
)

//https://stackoverflow.com/questions/17156371/how-to-get-json-response-from-http-get
type UserResponse struct {
	Username string `json:"usernmae"`
	Email    string `json:"email"`
	OAuth    bool `json:"oauth"`
	Provider string `json:"provider"`
	Id 	     string `json:"id"`
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

	var user UserResponse
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return fmt.Errorf("failed to decode response: %w", err)
	}

	fmt.Printf("User details:\n")
		fmt.Printf("  Username: %s\n", user.Username)
		fmt.Printf("  Email: %s\n", user.Email)
		fmt.Printf("  OAuth: %t\n", user.OAuth)
		fmt.Printf("  Provider: %s\n", user.Provider)
		fmt.Printf("  Id: %s\n", user.Id)

	return nil
}
