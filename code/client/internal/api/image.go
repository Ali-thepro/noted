package api

import (
	"fmt"
	"bytes"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

type ImageResponse struct {
    URL string `json:"imageUrl"`
}

func (c *Client) UploadImage(filePath string) (*ImageResponse, error) {
    if err := validateFile(filePath); err != nil {
        return nil, fmt.Errorf("file validation failed: %w", err)
    }

    body, contentType, err := c.createMultipartForm(filePath)
    if err != nil {
        return nil, err
    }

    resp, err := c.doMultipartRequest("/image/upload", body, contentType)
    if err != nil {
        return nil, err
    }

    var result ImageResponse
    if err := c.handleResponse(resp, &result); err != nil {
        return nil, err
    }

    return &result, nil
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

func (c *Client) createMultipartForm(filePath string) (*bytes.Buffer, string, error) {
    // https://sebastianroy.de/sending-images-in-post-request-as-multipart-form-from-go-to-microservice/
    body := &bytes.Buffer{}
    writer := multipart.NewWriter(body)

    file, err := os.Open(filePath)
    if err != nil {
        return nil, "", fmt.Errorf("failed to open file: %w", err)
    }
    defer file.Close()

    part, err := writer.CreateFormFile("image", filepath.Base(filePath))
    if err != nil {
        return nil, "", fmt.Errorf("failed to create form file: %w", err)
    }

    if _, err := io.Copy(part, file); err != nil {
        return nil, "", fmt.Errorf("failed to copy file to request: %w", err)
    }

    if err := writer.Close(); err != nil {
        return nil, "", fmt.Errorf("failed to close multipart writer: %w", err)
    }

    return body, writer.FormDataContentType(), nil
}
