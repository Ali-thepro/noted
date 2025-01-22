package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"noted/internal/metadata"
)

type Note struct {
	ID        string   `json:"id"`
	User      string   `json:"user"`
	Title     string   `json:"title"`
	Content   string   `json:"content"`
	Tags      []string `json:"tags"`
	UpdatedAt string   `json:"updatedAt"`
	CreatedAt string   `json:"createdAt"`
}

type CreateNoteRequest struct {
	Title   string   `json:"title"`
	Content string   `json:"content"`
	Tags    []string `json:"tags"`
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

	_, err = metadata.AddNote(note.ID, note.Title, note.Tags)
	if err != nil {
		return nil, fmt.Errorf("failed to save note metadata: %w", err)
	}

	return &note, nil
}
