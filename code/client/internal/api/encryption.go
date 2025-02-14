package api

import (
	"bytes"
	"encoding/json"
	"fmt"
)

type EncryptionSetupData struct {
	MasterPasswordHash    string `json:"masterPasswordHash"`
	ProtectedSymmetricKey string `json:"protectedSymmetricKey"`
	IV                    string `json:"iv"`
}

func (c *Client) SetupEncryption(data *EncryptionSetupData) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("failed to marshal encryption data: %w", err)
	}

	resp, err := c.doRequest("POST", "/encryption/setup", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to send encryption setup request: %w", err)
	}

	return c.handleResponse(resp, nil)
}

func (c *Client) GetMasterPasswordHash() (string, error) {
	resp, err := c.doRequest("GET", "/encryption/password", nil)
	if err != nil {
		return "", fmt.Errorf("failed to get master password hash: %w", err)
	}

	var hash string
	if err := c.handleResponse(resp, &hash); err != nil {
		return "", err
	}

	return hash, nil
}

func (c *Client) GetProtectedSymmetricKey() (string, error) {
	resp, err := c.doRequest("GET", "/encryption/symmetric-key", nil)
	if err != nil {
		return "", fmt.Errorf("failed to get protected symmetric key: %w", err)
	}

	var key string
	if err := c.handleResponse(resp, &key); err != nil {
		return "", err
	}

	return key, nil
}

func (c *Client) GetIV() (string, error) {
	resp, err := c.doRequest("GET", "/encryption/iv", nil)
	if err != nil {
		return "", fmt.Errorf("failed to get IV: %w", err)
	}

	var iv string
	if err := c.handleResponse(resp, &iv); err != nil {
		return "", err
	}

	return iv, nil
}
