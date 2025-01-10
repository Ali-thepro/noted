package api

import (
	"fmt"
	"bytes"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"encoding/json"
	"noted/internal/token"
	"noted/internal/config"
	"strings"
)

type ImageResponse struct {
	URL string `json:"imageUrl"`
}


func UploadImage(filePath string) error {
	cfg := config.NewConfig()
	url := fmt.Sprintf("%s/image/upload", cfg.APIURL)

	tokenStr, err := token.Load()
	if err != nil {
		return fmt.Errorf("failed to load token - please login again: %w", err)
	}

	if err := validateFile(filePath); err != nil {
		return fmt.Errorf("please ensure you only upload images, file validation failed: %w", err)
	}

	file, err := os.Open(filePath)
	if err != nil {
		return fmt.Errorf("failed to open file: %w", err)
	}
	defer file.Close()

	// https://sebastianroy.de/sending-images-in-post-request-as-multipart-form-from-go-to-microservice/
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	part, err := writer.CreateFormFile("image", filepath.Base(filePath))
	if err != nil {
		return fmt.Errorf("failed to create form file: %w", err)
	}

	if _, err := io.Copy(part, file); err != nil {
		return fmt.Errorf("failed to copy file to request: %w", err)
	}

	if err := writer.Close(); err != nil {
		return fmt.Errorf("failed to close mulitpart writer: %w", err)
	}

	req, err := http.NewRequest("POST", url, body)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.Header.Set("Authorization", "Bearer "+tokenStr)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	bodyResp, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response body: %w", err)
	}

	switch resp.StatusCode {
	case http.StatusOK:
		var image ImageResponse
		if err := json.Unmarshal(bodyResp, &image); err != nil {
			return fmt.Errorf("failed to decode response body: %w", err)
		}
		fmt.Printf("Image uploaded successfully - please use this URL in your markdown note: %s\n", image.URL)

	case http.StatusUnauthorized:
		var errResponse ErrorResponse
		if err := json.Unmarshal(bodyResp, &errResponse); err != nil {
			return fmt.Errorf("failed to parse error response: %w", err)
		}

		fmt.Println("Error:", errResponse.Error)
		fmt.Println("Your session has expired. Please login again.")

		os.Exit(1)

	default:
		var errorResp ErrorResponse
		if err := json.Unmarshal(bodyResp, &errorResp); err != nil {
			return fmt.Errorf("unexpected status code %d and failed to parse error message: %w", resp.StatusCode, err)
		}
		return fmt.Errorf("server returned status %d: %s", resp.StatusCode, errorResp.Error)

	}

	return nil
}

func validateFile(filePath string) error {
	info, err := os.Stat(filePath)
	if err != nil {
		return fmt.Errorf("failed to stat file: %w", err)
	}

	if info.IsDir() {
		return fmt.Errorf("path is a directory, not an image")
	}

	if info.Size() > 10*1024*1024 {
		return fmt.Errorf("file size exceeds maximum allowed size of 10MB")
	}

	// https://stackoverflow.com/questions/25959386/how-to-check-if-a-file-is-a-valid-image, https://socketloop.com/tutorials/golang-how-to-verify-uploaded-file-is-image-or-allowed-file-types

	file, err := os.Open(filePath)
	if err != nil {
		return fmt.Errorf("failed to open file for MIME check: %w", err)
	}
	defer file.Close()

	buf := make([]byte, 512)
	if _, err := file.Read(buf); err != nil {
		return fmt.Errorf("failed to read file for MIME check: %w", err)
	}
	
	// https://www.codecademy.com/resources/docs/go/strings/hasprefix
	contentType := http.DetectContentType(buf)
	if !strings.HasPrefix(contentType, "image/") {
		return fmt.Errorf("note an image file (detected type: %s)", contentType)
	}

	return nil
}