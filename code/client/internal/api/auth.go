package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"noted/internal/config"
	"noted/internal/token"
)

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

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return fmt.Errorf("failed to decode response: %w", err)
	}

	fmt.Printf("User details:\n")
	for k, v := range result {
		fmt.Printf("  %s: %v\n", k, v)
	}

	return nil
}
