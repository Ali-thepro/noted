package config

import (
	"encoding/json"
	"fmt"
	"noted/internal/token"
	"os"
	"path/filepath"
)

type Config struct {
	APIURL string `json:"apiUrl"`
	Theme  string `json:"theme"`
}

const configFile = "config.json"

var ValidThemes = []string{"dark", "light", "ascii", "dracula", "tokyo-night", "notty", "pink"}

func NewConfig() *Config {
	config, err := LoadConfig()
	if err != nil {
		return &Config{
			APIURL: "http://localhost:3000/api",
			Theme:  "auto",
		}
	}
	return config
}

func LoadConfig() (*Config, error) {
	dir, err := token.GetConfigDir()
	if err != nil {
		return nil, fmt.Errorf("failed to get config directory: %w", err)
	}

	path := filepath.Join(dir, configFile)
	data, err := os.ReadFile(path)
	if os.IsNotExist(err) {
		return &Config{
			APIURL: "http://localhost:3000/api",
			Theme:  "auto",
		}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to read config: %w", err)
	}

	var config Config
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, fmt.Errorf("failed to parse config: %w", err)
	}

	return &config, nil
}

func SaveConfig(config *Config) error {
	dir, err := token.GetConfigDir()
	if err != nil {
		return fmt.Errorf("failed to get config directory: %w", err)
	}

	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal config: %w", err)
	}

	path := filepath.Join(dir, configFile)
	if err := os.WriteFile(path, data, 0600); err != nil {
		return fmt.Errorf("failed to write config: %w", err)
	}

	return nil
}

func IsValidTheme(theme string) bool {
	if theme == "auto" {
		return true
	}
	for _, t := range ValidThemes {
		if t == theme {
			return true
		}
	}
	return false
}
