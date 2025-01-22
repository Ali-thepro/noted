package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"noted/internal/config"
	"noted/internal/token"
)

type Client struct {
	baseURL    string
	httpClient *http.Client
}

type ErrorResponse struct {
	Error string `json:"error"`
}

func NewClient() (*Client, error) {
	cfg := config.NewConfig()
	return &Client{
		baseURL:    cfg.APIURL,
		httpClient: &http.Client{},
	}, nil
}

func (c *Client) doRequest(method, path string, body io.Reader) (*http.Response, error) {
	url := fmt.Sprintf("%s%s", c.baseURL, path)

	// https://www.digitalocean.com/community/tutorials/how-to-make-http-requests-in-go
	req, err := http.NewRequest(method, url, body)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// https://stackoverflow.com/questions/51452148/how-can-i-make-a-request-with-a-bearer-token-in-go
	tokenStr, err := token.Load()
	if err != nil {
		return nil, fmt.Errorf("failed to load token - please login again: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+tokenStr)
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}

	return resp, nil
}

func (c *Client) handleResponse(resp *http.Response, result interface{}) error {
	defer resp.Body.Close()

	// https://www.golangprograms.com/how-do-you-handle-http-errors-in-go.html
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode == http.StatusUnauthorized {
		var errResp ErrorResponse
		if err := json.Unmarshal(body, &errResp); err != nil {
			return fmt.Errorf("failed to parse error response: %w", err)
		}
		fmt.Println("Your session has expired. Please login again.")
		return fmt.Errorf("%s", errResp.Error)
	}

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		var errResp ErrorResponse
		if err := json.Unmarshal(body, &errResp); err != nil {
			return fmt.Errorf("unexpected status code %d and failed to parse error message: %w", resp.StatusCode, err)
		}
		return fmt.Errorf("server returned status %d: %s", resp.StatusCode, errResp.Error)
	}

	if result != nil {
		if err := json.Unmarshal(body, result); err != nil {
			return fmt.Errorf("failed to decode response body: %w", err)
		}
	}

	return nil
}

func (c *Client) doMultipartRequest(path string, body *bytes.Buffer, contentType string) (*http.Response, error) {
	url := fmt.Sprintf("%s%s", c.baseURL, path)

	req, err := http.NewRequest("POST", url, body)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	tokenStr, err := token.Load()
	if err != nil {
		return nil, fmt.Errorf("failed to load token - please login again: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+tokenStr)
	req.Header.Set("Content-Type", contentType)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}

	return resp, nil
}
