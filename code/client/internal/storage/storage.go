package storage

import (
	"encoding/json"
	"fmt"
	"noted/internal/token"
	"noted/internal/utils"
	"os"
	"path/filepath"
	"sort"
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

func AddNote(id, title string, tags []string, content string) (*Note, error) {
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

	dir, err := token.GetConfigDir()
	if err != nil {
		return nil, fmt.Errorf("failed to get config directory: %w", err)
	}

	notePath := filepath.Join(dir, filename)
	if err := os.WriteFile(notePath, []byte(content), 0600); err != nil {
		return nil, fmt.Errorf("failed to write note file: %w", err)
	}

	index.Notes = append(index.Notes, note)
	if err := SaveIndex(index); err != nil {
		return nil, err
	}

	return &note, nil
}

func SelectNote(title string) (*Note, error) {
	matches, err := FindNotes(title)
	if err != nil {
		return nil, err
	}

	switch len(matches) {
	case 0:
		return nil, fmt.Errorf("no note found with title: %s", title)
	case 1:
		return &matches[0], nil
	default:
		fmt.Printf("Multiple notes found with title \"%s\":\n", title)
		for i, note := range matches {
			fmt.Printf("[%d] %s %s  (created: %s, updated: %s)\n",
				i+1,
				note.ShortID,
				note.Title,
				note.CreatedAt.Format("2006-01-02 15:04:05"),
				note.UpdatedAt.Format("2006-01-02 15:04:05"),
			)
		}

		var choice int
		fmt.Print("Choose a number: ")
		_, err := fmt.Scanf("%d", &choice)
		if err != nil || choice < 1 || choice > len(matches) {
			return nil, fmt.Errorf("invalid selection")
		}

		return &matches[choice-1], nil
	}
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

	sort.Slice(matches, func(i, j int) bool {
		return matches[i].UpdatedAt.After(matches[j].UpdatedAt)
	})

	return matches, nil
}

func GetNoteByID(id string) (*Note, error) {
	index, err := LoadIndex()
	if err != nil {
		return nil, err
	}

	for _, note := range index.Notes {
		if note.ID == id {
			return &note, nil
		}
	}

	for _, note := range index.Notes {
		if note.ShortID == id {
			return &note, nil
		}
	}

	return nil, fmt.Errorf("no note found with ID: %s", id)
}

func DeleteNote(id string) error {
	index, err := LoadIndex()
	if err != nil {
		return err
	}

	var found bool
	var filename string
	var newNotes []Note

	for _, note := range index.Notes {
		if note.ID == id || note.ShortID == id {
			found = true
			filename = note.Filename
		} else {
			newNotes = append(newNotes, note)
		}
	}

	if !found {
		return fmt.Errorf("no note found with ID: %s", id)
	}

	dir, err := token.GetConfigDir()
	if err != nil {
		return fmt.Errorf("failed to get config directory: %w", err)
	}

	notePath := filepath.Join(dir, filename)
	if err := os.Remove(notePath); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("failed to delete note file: %w", err)
	}

	index.Notes = newNotes
	if err := SaveIndex(index); err != nil {
		return fmt.Errorf("failed to update index: %w", err)
	}

	return nil
}
