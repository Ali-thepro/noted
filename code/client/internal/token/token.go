package token

import (
	"encoding/json"
	"os"
	"path/filepath"
)

type Token struct {
	Token string `json:"token"`
}

func Save(token string) error {
	configDir, err := getConfigDir()
	if err != nil {
		return err
	}

	tokenData := Token{Token: token}
	data, err := json.Marshal(tokenData)
	if err != nil {
		return err
	}

	return os.WriteFile(filepath.Join(configDir, "token.json"), data, 0600)
}

func Load() (string, error) {
	configDir, err := getConfigDir()
	if err != nil {
		return "", err
	}

	data, err := os.ReadFile(filepath.Join(configDir, "token.json"))
	if err != nil {
		return "", err
	}

	var tokenData Token
	if err := json.Unmarshal(data, &tokenData); err != nil {
		return "", err
	}

	return tokenData.Token, nil
}

func Remove() error {
	configDir, err := getConfigDir()
	if err != nil {
		return err
	}

	return os.Remove(filepath.Join(configDir, "token.json"))
}

func getConfigDir() (string, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}

	configDir := filepath.Join(homeDir, ".noted")
	if err := os.MkdirAll(configDir, 0700); err != nil {
		return "", err
	}

	return configDir, nil
}
