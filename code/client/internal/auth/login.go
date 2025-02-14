package auth

import (
	"fmt"
	"golang.org/x/term"
	"github.com/nbutton23/zxcvbn-go"
	"net/http"
	"noted/internal/api"
	"noted/internal/encryption"
	"noted/internal/storage"
	"noted/internal/token"
	"os"
	"os/signal"
	"strings"
	"syscall"
)

const (
	callbackPort = 2005
	frontendURL  = "http://localhost:5173"
)

func HandleLogin() error {
	tokenChan := make(chan string)
	errChan := make(chan error)

	server := startCallbackServer(tokenChan, errChan)
	defer server.Close()

	loginURL := fmt.Sprintf("%s/signin?mode=cli&redirect=http://localhost:%d", frontendURL, callbackPort)
	if err := openBrowser(loginURL); err != nil {
		return fmt.Errorf("failed to open browser: %w", err)
	}

	fmt.Println("Waiting for authentication...")

	// https://stackoverflow.com/questions/18106749/golang-catch-signals
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM, syscall.SIGTSTP)

	select {
	case token := <-tokenChan:
		return handleSuccessfullLogin(token)
	case err := <-errChan:
		return fmt.Errorf("failed to authenticate: %w", err)
	case <-sigChan:
		stdin := int(syscall.Stdin)
		oldState, err := term.GetState(stdin)
		if err != nil {
			return fmt.Errorf("failed to get terminal state: %w", err)
		}
		if err = term.Restore(stdin, oldState); err != nil {
			return fmt.Errorf("failed to restore terminal state: %w", err)
		}
		signal.Reset(syscall.SIGTSTP)
		if err = syscall.Kill(syscall.Getpid(), syscall.SIGTSTP); err != nil {
			return fmt.Errorf("failed to kill process: %w", err)
		}
		return fmt.Errorf("authentication cancelled")
	}

}

// https://stackoverflow.com/questions/36248946/should-i-use-servemux-or-http-directly-in-golang
// https://pkg.go.dev/go.reizu.org/servemux,  https://www.alexedwards.net/blog/an-introduction-to-handlers-and-servemuxes-in-go
func startCallbackServer(tokenChan chan string, errorChan chan error) *http.Server {
	mux := http.NewServeMux()
	server := &http.Server{
		Addr:    fmt.Sprintf(":%d", callbackPort),
		Handler: mux,
	}

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		handleCallback(w, r, tokenChan, errorChan)
	})

	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			errorChan <- fmt.Errorf("failed to start callback server: %w", err)
		}
	}()

	return server
}

func handleCallback(w http.ResponseWriter, r *http.Request, tokenChan chan string, errorChan chan error) {
	token := r.URL.Query().Get("token") // https://stackoverflow.com/questions/15407719/in-gos-http-package-how-do-i-get-the-query-string-on-a-post-request
	createMasterPassword := r.URL.Query().Get("createMasterPassword") == "true"
	if token == "" {
		errorChan <- fmt.Errorf("no token received")
		http.Error(w, "no token received", http.StatusBadRequest)
		return
	}

	// https://stackoverflow.com/questions/38110875/how-to-display-html-string-as-a-web-page-using-golang-http-responsewriter
	w.Header().Set("Content-Type", "text/html")
	fmt.Fprint(w, `
		<html>
			<body style="display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: Arial, sans-serif;">
				<div style="text-align: center;">
					<h1>Authentication Successful!</h1>
					<p>You can now close this tab and return to your terminal.</p>
				</div>
			</body>
		</html>
	`)

	tokenChan <- fmt.Sprintf("%s:%t", token, createMasterPassword)
}

func handleSuccessfullLogin(tokenStr string) error {
	parts := strings.Split(tokenStr, ":")
	tokenStr = parts[0]
	createMasterPassword := len(parts) > 1 && parts[1] == "true"

	if err := token.Save(tokenStr); err != nil {
		return fmt.Errorf("failed to save token: %w", err)
	}

	if err := storage.VerifyUser(); err != nil {
		return fmt.Errorf("failed to verify user: %w", err)
	}

	if createMasterPassword {
		if err := SetupEncryption(); err != nil {
			return fmt.Errorf("failed to setup encryption: %w", err)
		}
	} else {
		if err := EncryptionLogin(); err != nil {
			return fmt.Errorf("failed to login to encryption: %w", err)
		}
	}
	fmt.Println("Successfully logged in")
	return nil
}

func SetupEncryption() error {
	e := encryption.NewEncryptionService()
    fmt.Println("\nPlease set up your master password.")
    fmt.Println("This password will be used to encrypt your notes and cannot be recovered if lost.")
    fmt.Println("Make sure to use a strong password that you can remember.")

    stdin := int(syscall.Stdin)
    oldState, err := term.GetState(stdin)
    if err != nil {
        return fmt.Errorf("failed to get terminal state: %w", err)
    }
    sigChan := make(chan os.Signal, 1)
    signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM, syscall.SIGTSTP)
    defer signal.Stop(sigChan)

    go func() {
        for range sigChan {
            _ = term.Restore(stdin, oldState)
			os.Exit(1)
        }
    }()
	for {
		fmt.Print("Enter master password: ")
		password, err := term.ReadPassword(stdin)
		if err != nil {
			return fmt.Errorf("failed to read password: %w", err)
		}
		fmt.Println()
	
		fmt.Print("Confirm master password: ")
		confirmPassword, err := term.ReadPassword(stdin)
		if err != nil {
			return fmt.Errorf("failed to read confirmation password: %w", err)
		}
		fmt.Println()
	
		if string(password) != string(confirmPassword) {
			fmt.Println("\nPasswords do not match. Please try again.")
            continue
		}
	
		client, err := api.NewClient()
		if err != nil {
			return fmt.Errorf("failed to create client: %w", err)
		}
	
		user, err := client.GetMe()
		if err != nil {
			return fmt.Errorf("failed to get user: %w", err)
		}

		userInput := []string{user.Email, user.Username}
		result := zxcvbn.PasswordStrength(string(password), userInput)
		if result.Score < 2 {
			fmt.Println("\nPassword is too weak. Please try again.")
			continue
		}
	
		emailHash, err := e.Hash(user.Email)
		if err != nil {
			return fmt.Errorf("failed to hash email: %w", err)
		}
	
		masterKey, err := e.GenerateMasterKey(string(password), emailHash)
		if err != nil {
			return fmt.Errorf("failed to generate master key: %w", err)
		}
		passwordHash, err := e.Hash(string(password))
		if err != nil {
			return fmt.Errorf("failed to hash password: %w", err)
		}
	
		masterPasswordHash, err := e.GenerateMasterPasswordHash(masterKey, passwordHash)
		if err != nil {
			return fmt.Errorf("failed to generate master password hash: %w", err)
		}
	
		stretchedKey, err := e.HKDF(masterKey, emailHash)
		if err != nil {
			return fmt.Errorf("failed to generate stretched key: %w", err)
		}
	
		key, err := e.GenerateKey(32)
		if err != nil {
			return fmt.Errorf("failed to generate key: %w", err)
		}
	
		encryptedKey, iv, err := e.EncryptSymmetricKey(key, stretchedKey)
		if err != nil {
			return fmt.Errorf("failed to encrypt symmetric key: %w", err)
		}
		setupData := &api.EncryptionSetupData{
			MasterPasswordHash:    masterPasswordHash,
			ProtectedSymmetricKey: encryptedKey,
			IV:                    iv,
		}
	
		err = client.SetupEncryption(setupData)
		if err != nil {
			return fmt.Errorf("failed to setup encryption: %w", err)
		}
		fmt.Println("masterPasswordHash:", masterPasswordHash)
		fmt.Println("Encrypted key:", encryptedKey)
		fmt.Println("IV:", iv)
	
		return nil
	}
}

func EncryptionLogin() error {
	e := encryption.NewEncryptionService()

    stdin := int(syscall.Stdin)
    oldState, err := term.GetState(stdin)
    if err != nil {
        return fmt.Errorf("failed to get terminal state: %w", err)
    }
	sigChan := make(chan os.Signal, 1)
    signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM, syscall.SIGTSTP)
    defer signal.Stop(sigChan)

    go func() {
        for range sigChan {
            _ = term.Restore(stdin, oldState)
			os.Exit(1)
        }
    }()

	for {
		fmt.Print("Enter master password: ")
		password, err := term.ReadPassword(int(syscall.Stdin))
		if err != nil {
			return fmt.Errorf("failed to read password: %w", err)
		}
		fmt.Println()
	
		client, err := api.NewClient()
		if err != nil {
			return fmt.Errorf("failed to create client: %w", err)
		}
	
		user, err := client.GetMe()
		if err != nil {
			return fmt.Errorf("failed to get user: %w", err)
		}
	
		masterPasswordHash, err := client.GetMasterPasswordHash()
		if err != nil {
			return fmt.Errorf("failed to get master password hash: %w", err)
		}
	
		protectedSymmetricKey, err := client.GetProtectedSymmetricKey()
		if err != nil {
			return fmt.Errorf("failed to get protected symmetric key: %w", err)
		}

		iv, err := client.GetIV()
		if err != nil {
			return fmt.Errorf("failed to get iv: %w", err)
		}
	
		emailHash, err := e.Hash(user.Email)
		if err != nil {
			return fmt.Errorf("failed to hash email: %w", err)
		}
	
		masterKey, err := e.GenerateMasterKey(string(password), emailHash)
		if err != nil {
			return fmt.Errorf("failed to generate master key: %w", err)
		}
	
		passwordHash, err := e.Hash(string(password))
		if err != nil {
			return fmt.Errorf("failed to hash password: %w", err)
		}
	
		encodedMasterPasswordHash, err := e.GenerateMasterPasswordHash(masterKey, passwordHash)
		if err != nil {
			return fmt.Errorf("failed to generate master password hash: %w", err)
		}

		isCorrect, err := e.SecureCompare(encodedMasterPasswordHash, masterPasswordHash)
		if err != nil {
			return fmt.Errorf("failed to compare master password hash: %w", err)
		}
		if !isCorrect {
			fmt.Println("\nIncorrect master password")
			continue
		}
		stretchedKey, err := e.HKDF(masterKey, emailHash)
		if err != nil {
			return fmt.Errorf("failed to generate stretched key: %w", err)
		}

		symmetricKey, err := e.DecryptSymmetricKey(protectedSymmetricKey, iv, stretchedKey)
		if err != nil {
			return fmt.Errorf("failed to decrypt symmetric key: %w", err)
		}

		fmt.Println("symmetricKey:", symmetricKey)
		return nil
	}
}
