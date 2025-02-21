package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"time"
)

type VersionMetadata struct {
	Title         string   `json:"title,omitempty"`
	Tags          []string `json:"tags,omitempty"`
	VersionNumber int      `json:"versionNumber"`
}

type Version struct {
	ID          string          `json:"id"`
	NoteID      string          `json:"noteId"`
	Type        string          `json:"type"`
	Content     string          `json:"content"`
	BaseVersion string          `json:"baseVersion,omitempty"`
	Metadata    VersionMetadata `json:"metadata"`
	CreatedAt   time.Time       `json:"createdAt"`
	CipherKey   string          `json:"cipherKey"`
	CipherIv    string          `json:"cipherIv"`
	ContentIv   string          `json:"contentIv"`
}

type CreateVersionRequest struct {
	Type        string          `json:"type"`
	Content     string          `json:"content"`
	BaseVersion string          `json:"baseVersion,omitempty"`
	Metadata    VersionMetadata `json:"metadata"`
	CipherKey   string          `json:"cipherKey"`
	CipherIv    string          `json:"cipherIv"`
	ContentIv   string          `json:"contentIv"`
}

func (c *Client) CreateVersion(noteID string, req *CreateVersionRequest) (*Version, error) {
	data, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	resp, err := c.doRequest("POST", fmt.Sprintf("/version/%s", noteID), bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}

	var version Version
	if err := c.handleResponse(resp, &version); err != nil {
		return nil, err
	}

	return &version, nil
}

func (c *Client) GetVersions(noteID string) ([]*Version, error) {
	resp, err := c.doRequest("GET", fmt.Sprintf("/version/%s", noteID), nil)
	if err != nil {
		return nil, err
	}

	var versions []*Version
	if err := c.handleResponse(resp, &versions); err != nil {
		return nil, err
	}

	return versions, nil
}

func (c *Client) GetVersionChain(noteID string, until time.Time) ([]*Version, error) {
	url := fmt.Sprintf("/version/%s/chain", noteID)
	if !until.IsZero() {
		url += fmt.Sprintf("?until=%s", until.Format(time.RFC3339Nano))
	}

	resp, err := c.doRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	var versions []*Version
	if err := c.handleResponse(resp, &versions); err != nil {
		return nil, err
	}

	return versions, nil
}
