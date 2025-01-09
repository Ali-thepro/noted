package auth

import (
	"fmt"
	"net/http"
	"noted/internal/token"
	"os"
	"os/signal"
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
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	select {
	case token := <-tokenChan:
		return handleSuccessfullLogin(token)
	case err := <-errChan:
		return fmt.Errorf("failed to authenticate: %w", err)
	case <-sigChan:
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

	tokenChan <- token
}

func handleSuccessfullLogin(tokenStr string) error {
	if err := token.Save(tokenStr); err != nil {
		return fmt.Errorf("failed to save token: %w", err)
	}

	fmt.Println("Successfully logged in")
	return nil
}
