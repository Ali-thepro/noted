package storage

import (
	"encoding/json"
	"fmt"
	"noted/internal/api"
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
	Title     string    `json:"title"`
	Filename  string    `json:"filename"`
	Tags      []string  `json:"tags"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type Index struct {
	Notes    []Note         `json:"notes"`
	LastSync time.Time      `json:"lastSync"`
	idMap    map[string]int `json:"-"`
}

const (
	indexFile = "index.json"
)

func LoadIndex() (*Index, error) {
	dir, err := token.GetConfigDir()
	if err != nil {
		return nil, fmt.Errorf("failed to get config directory: %w", err)
	}

	path := filepath.Join(dir, indexFile)
	data, err := os.ReadFile(path)
	if os.IsNotExist(err) {
		return &Index{
			Notes: []Note{},
			idMap: make(map[string]int),
		}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to read index: %w", err)
	}

	var index Index
	if err := json.Unmarshal(data, &index); err != nil {
		return nil, fmt.Errorf("failed to parse index: %w", err)
	}

	index.idMap = make(map[string]int, len(index.Notes))
	for i, note := range index.Notes {
		index.idMap[note.ID] = i
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

func AddNote(note *api.Note, existingIndex ...*Index) (*Note, error) {
	var index *Index
	var err error

	if len(existingIndex) > 0 && existingIndex[0] != nil {
		index = existingIndex[0]
	} else {
		index, err = LoadIndex()
		if err != nil {
			return nil, err
		}
	}

	sanitizedTitle := utils.SanitiseTitle(note.Title)
	filename := fmt.Sprintf("%s-%s.md", note.ID, sanitizedTitle)

	createdAt, err := time.Parse(time.RFC3339, note.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("invalid CreatedAt format: %w", err)
	}

	updatedAt, err := time.Parse(time.RFC3339, note.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("invalid UpdatedAt format: %w", err)
	}

	newNote := Note{
		ID:        note.ID,
		Title:     note.Title,
		Filename:  filename,
		Tags:      note.Tags,
		CreatedAt: createdAt,
		UpdatedAt: updatedAt,
	}

	dir, err := token.GetConfigDir()
	if err != nil {
		return nil, fmt.Errorf("failed to get config directory: %w", err)
	}

	if idx, exists := index.idMap[note.ID]; exists {
		if index.Notes[idx].Filename != filename {
			oldPath := filepath.Join(dir, index.Notes[idx].Filename)
			if err := os.Remove(oldPath); err != nil && !os.IsNotExist(err) {
				return nil, fmt.Errorf("failed to remove old note file: %w", err)
			}
		}
		index.Notes[idx] = newNote
	} else {
		index.Notes = append(index.Notes, newNote)
		index.idMap[note.ID] = len(index.Notes) - 1
	}

	notePath := filepath.Join(dir, filename)
	if err := os.WriteFile(notePath, []byte(note.Content), 0600); err != nil {
		return nil, fmt.Errorf("failed to write note file: %w", err)
	}

	if err := SaveIndex(index); err != nil {
		return nil, fmt.Errorf("failed to update index: %w", err)
	}

	return &newNote, nil
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
				note.ID,
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

	idx, exists := index.idMap[id]
	if !exists {
		return nil, fmt.Errorf("no note found with ID: %s", id)
	}

	note := index.Notes[idx]
	return &note, nil
}

func DeleteNote(id string) error {
	index, err := LoadIndex()
	if err != nil {
		return err
	}

	idx, exists := index.idMap[id]
	if !exists {
		return fmt.Errorf("no note found with ID: %s", id)
	}

	filename := index.Notes[idx].Filename

	index.Notes = append(index.Notes[:idx], index.Notes[idx+1:]...)
	delete(index.idMap, id)

	dir, err := token.GetConfigDir()
	if err != nil {
		return fmt.Errorf("failed to get config directory: %w", err)
	}

	notePath := filepath.Join(dir, filename)
	if err := os.Remove(notePath); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("failed to delete note file: %w", err)
	}

	if err := SaveIndex(index); err != nil {
		return fmt.Errorf("failed to update index: %w", err)
	}

	return nil
}

func UpdateNote(note *api.Note) error {
	index, err := LoadIndex()
	if err != nil {
		return err
	}

	idx, exists := index.idMap[note.ID]
	if !exists {
		return fmt.Errorf("note not found in local storage")
	}

	updatedAt, err := time.Parse(time.RFC3339, note.UpdatedAt)
	if err != nil {
		return err
	}

	index.Notes[idx].UpdatedAt = updatedAt

	if err := SaveIndex(index); err != nil {
		return fmt.Errorf("failed to update index: %w", err)
	}

	return nil
}

func ReadNoteContent(filename string) (string, error) {
	dir, err := token.GetConfigDir()
	if err != nil {
		return "", fmt.Errorf("failed to get config directory: %w", err)
	}
	content, err := os.ReadFile(filepath.Join(dir, filename))
	if err != nil {
		return "", fmt.Errorf("failed to read note file: %w", err)
	}

	return string(content), nil
}

func UpdateNoteMetadata(oldNote *Note, newNote *api.Note) error {
	index, err := LoadIndex()
	if err != nil {
		return err
	}

	dir, err := token.GetConfigDir()
	if err != nil {
		return fmt.Errorf("failed to get config directory: %w", err)
	}

	sanitizedTitle := utils.SanitiseTitle(newNote.Title)
	newFilename := fmt.Sprintf("%s-%s.md", newNote.ID, sanitizedTitle)

	if oldNote.Filename != newFilename {
		oldPath := filepath.Join(dir, oldNote.Filename)
		newPath := filepath.Join(dir, newFilename)
		if err := os.Rename(oldPath, newPath); err != nil {
			return fmt.Errorf("failed to rename note file: %w", err)
		}
	}

	updatedAt, err := time.Parse(time.RFC3339, newNote.UpdatedAt)
	if err != nil {
		return fmt.Errorf("invalid UpdatedAt format: %w", err)
	}

	idx, exists := index.idMap[newNote.ID]
	if !exists {
		return fmt.Errorf("note not found in local storage")
	}

	index.Notes[idx].Title = newNote.Title
	index.Notes[idx].Tags = newNote.Tags
	index.Notes[idx].Filename = newFilename
	index.Notes[idx].UpdatedAt = updatedAt

	if err := SaveIndex(index); err != nil {
		return fmt.Errorf("failed to update index: %w", err)
	}

	return nil
}
