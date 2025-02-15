package auth

import (
	"encoding/base64"
	"fmt"
	"os"
)

func GetSessionKey() ([]byte, error) {
	encodedKey := os.Getenv("NOTED_KEY")
	if encodedKey == "" {
		return nil, fmt.Errorf("no session key found, please unlock first")
	}

	symmetricKey, err := base64.StdEncoding.DecodeString(encodedKey)
	if err != nil {
		return nil, fmt.Errorf("invalid session key format")
	}

	return symmetricKey, nil
}
