package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/url"
	"time"
)

type Note struct {
	ID        string   `json:"id"`
	User      string   `json:"user"`
	Title     string   `json:"title"`
	Content   string   `json:"content"`
	Tags      []string `json:"tags"`
	UpdatedAt string   `json:"updatedAt"`
	CreatedAt string   `json:"createdAt"`
	CipherKey string   `json:"cipherKey"`
	CipherIv  string   `json:"cipherIv"`
	ContentIv string   `json:"contentIv"`
}

type CreateNoteRequest struct {
	Title     string   `json:"title"`
	Content   string   `json:"content"`
	Tags      []string `json:"tags"`
	CipherKey string   `json:"cipherKey"`
	CipherIv  string   `json:"cipherIv"`
	ContentIv string   `json:"contentIv"`
}

type UpdateNoteRequest struct {
	Title     string   `json:"title"`
	Tags      []string `json:"tags"`
	Content   string   `json:"content"`
	CipherKey string   `json:"cipherKey"`
	CipherIv  string   `json:"cipherIv"`
	ContentIv string   `json:"contentIv"`
}

type UpdateNoteMetadataRequest struct {
	Title string   `json:"title"`
	Tags  []string `json:"tags"`
}

type NoteMetadata struct {
	ID        string   `json:"id"`
	Title     string   `json:"title"`
	Tags      []string `json:"tags"`
	UpdatedAt string   `json:"updatedAt"`
	CreatedAt string   `json:"createdAt"`
}

type DeletedNote struct {
	ID        string    `json:"noteId"`
	DeletedAt time.Time `json:"deletedAt"`
}

type SearchResponse struct {
	Notes []*Note `json:"notes"`
	Total int     `json:"total"`
}

func (c *Client) SearchNotes(search, tag string) (*SearchResponse, error) {
	query := make(url.Values)
	if search != "" {
		query.Set("search", search)
	}
	if tag != "" {
		query.Set("tag", tag)
	}

	url := "/note/get"
	if len(query) > 0 {
		url += "?" + query.Encode()
	}

	resp, err := c.doRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	var searchResp SearchResponse
	if err := c.handleResponse(resp, &searchResp); err != nil {
		return nil, err
	}

	return &searchResp, nil
}

func (c *Client) GetNote(id string) (*Note, error) {
	resp, err := c.doRequest("GET", fmt.Sprintf("/note/get/%s", id), nil)
	if err != nil {
		return nil, err
	}

	var note Note
	if err := c.handleResponse(resp, &note); err != nil {
		return nil, err
	}

	return &note, nil
}

func (c *Client) CreateNote(req CreateNoteRequest) (*Note, error) {
	data, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	resp, err := c.doRequest("POST", "/note/create", bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}

	var note Note
	if err := c.handleResponse(resp, &note); err != nil {
		return nil, err
	}

	return &note, nil
}

func (c *Client) DeleteNote(id string) error {
	resp, err := c.doRequest("DELETE", fmt.Sprintf("/note/delete/%s", id), nil)
	if err != nil {
		return err
	}

	return c.handleResponse(resp, nil)
}

func (c *Client) UpdateNote(id string, req UpdateNoteRequest) (*Note, error) {
	data, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	resp, err := c.doRequest("PUT", fmt.Sprintf("/note/update/%s", id), bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}

	var note Note
	if err := c.handleResponse(resp, &note); err != nil {
		return nil, err
	}

	return &note, err
}

func (c *Client) UpdateNoteMetadata(id string, req UpdateNoteMetadataRequest) (*Note, error) {
	data, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	resp, err := c.doRequest("PUT", fmt.Sprintf("/note/update/%s", id), bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}

	var note Note
	if err := c.handleResponse(resp, &note); err != nil {
		return nil, err
	}

	return &note, nil
}

func (c *Client) GetNoteMetadata(since time.Time) ([]*NoteMetadata, error) {
	query := make(url.Values)
	if !since.IsZero() {
		query.Set("since", since.Format(time.RFC3339))
	}
	url := "/note/metadata"
	if len(query) > 0 {
		url += "?" + query.Encode()
	}

	resp, err := c.doRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	var metadata []*NoteMetadata
	if err := c.handleResponse(resp, &metadata); err != nil {
		return nil, err
	}

	return metadata, nil
}

func (c *Client) GetBulkNotes(ids []string) ([]*Note, error) {
	data, err := json.Marshal(map[string][]string{
		"ids": ids,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	resp, err := c.doRequest("POST", "/note/bulk", bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}

	var notes []*Note
	if err := c.handleResponse(resp, &notes); err != nil {
		return nil, err
	}

	return notes, nil
}

func (c *Client) GetDeletedNotes(since time.Time) ([]*DeletedNote, error) {
	query := make(url.Values)
	if !since.IsZero() {
		query.Set("since", since.Format(time.RFC3339))
	}

	url := "/note/deleted"
	if len(query) > 0 {
		url += "?" + query.Encode()
	}

	resp, err := c.doRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	var deletedNotes []*DeletedNote
	if err := c.handleResponse(resp, &deletedNotes); err != nil {
		return nil, err
	}

	return deletedNotes, nil
}
