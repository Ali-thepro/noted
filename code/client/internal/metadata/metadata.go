package metadata

import (
	"encoding/json"
	"fmt"
	"noted/internal/token"
	"noted/utils"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type Note struct {
	ID        string    `json:"id"`
	ShortID   string    `json:"shortId"`
	Title     string    `json:"title"`
	Filename  string    `json:"filename"`
	Tags      []string  `json:"tags"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type Index struct {
	Notes []Note `json:"notes"`
}

const (
	indexFile  = "index.json"
	shortIDLen = 6
)

func LoadIndex() (*Index, error) {
	dir, err := token.GetConfigDir()
	if err != nil {
		return nil, fmt.Errorf("failed to get config directory: %w", err)
	}

	path := filepath.Join(dir, indexFile)
	data, err := os.ReadFile(path)
	if os.IsNotExist(err) {
		return &Index{Notes: []Note{}}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to read index: %w", err)
	}

	var index Index
	if err := json.Unmarshal(data, &index); err != nil {
		return nil, fmt.Errorf("failed to parse index: %w", err)
	}

	return &index, nil
}

func SaveIndex(index *Index) error {
	dir, err := token.GetConfigDir()
	if err != nil {
		return fmt.Errorf("failed to get config directory: %w", err)
	}

	data, err := json.MarshalIndent(index, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal index: %w", err)
	}

	path := filepath.Join(dir, indexFile)
	if err := os.WriteFile(path, data, 0600); err != nil {
		return fmt.Errorf("failed to write index: %w", err)
	}

	return nil
}

func AddNote(id, title string, tags []string) (*Note, error) {
	index, err := LoadIndex()
	if err != nil {
		return nil, err
	}

	shortID := id[:shortIDLen]
	sanitizedTitle := utils.SanitiseTitle(title)
	filename := fmt.Sprintf("%s-%s.md", shortID, sanitizedTitle)
	now := time.Now().UTC()

	note := Note{
		ID:        id,
		ShortID:   shortID,
		Title:     title,
		Filename:  filename,
		Tags:      tags,
		CreatedAt: now,
		UpdatedAt: now,
	}

	index.Notes = append(index.Notes, note)
	if err := SaveIndex(index); err != nil {
		return nil, err
	}

	return &note, nil
}

func FindNotes(title string) ([]Note, error) {
	index, err := LoadIndex()
	if err != nil {
		return nil, err
	}

	var matches []Note
	searchTitle := strings.ToLower(title)

	for _, note := range index.Notes {
		if strings.ToLower(note.Title) == searchTitle {
			matches = append(matches, note)
		}
	}

	return matches, nil
}
