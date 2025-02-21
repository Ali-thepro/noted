package auth

import (
	"fmt"
	"noted/internal/token"
)

func HandleLogout() error {
	if err := token.Remove(); err != nil {
		return fmt.Errorf("failed to remove token: %w", err)
	}

	fmt.Println("Successfully logged out")
	return nil
}
