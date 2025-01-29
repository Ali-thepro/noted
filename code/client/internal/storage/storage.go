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
	Notes    []Note    `json:"notes"`
	LastSync time.Time `json:"lastSync"`
	UserID   string    `json:"userId"`
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
		}, nil
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

func ClearUserData() error {
	dir, err := token.GetConfigDir()
	if err != nil {
		return fmt.Errorf("failed to get config directory: %w", err)
	}

	indexPath := filepath.Join(dir, indexFile)
	if err := os.Remove(indexPath); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("failed to remove index file: %w", err)
	}

	files, err := os.ReadDir(dir)
	if err != nil {
		return fmt.Errorf("failed to read directory: %w", err)
	}

	for _, file := range files {
		if strings.HasSuffix(file.Name(), ".md") {
			if err := os.Remove(filepath.Join(dir, file.Name())); err != nil {
				return fmt.Errorf("failed to remove note file %s: %w", file.Name(), err)
			}
		}
	}

	return nil
}

func VerifyUser() error {
	index, loadErr := LoadIndex()

	if loadErr != nil && !os.IsNotExist(loadErr) {
		return fmt.Errorf("failed to load index: %w", loadErr)
	}
	client, err := api.NewClient()
	if err != nil {
		return fmt.Errorf("failed to create client: %w", err)
	}

	user, err := client.GetMe()
	if err != nil {
		return fmt.Errorf("failed to get user info: %w", err)
	}

	if os.IsNotExist(loadErr) || index.UserID != user.ID {
		if err := ClearUserData(); err != nil {
			return fmt.Errorf("failed to clear old user data: %w", err)
		}
		index = &Index{
			Notes:  []Note{},
			UserID: user.ID,
		}
		if err := SaveIndex(index); err != nil {
			return fmt.Errorf("failed to save new index: %w", err)
		}
	}

	return nil
}

func AddNote(note *api.Note) (*Note, error) {
	index, err := LoadIndex()
	if err != nil {
		return nil, err
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

	// Simply append the new note
	index.Notes = append(index.Notes, newNote)

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

	for _, note := range index.Notes {
		if note.ID == id {
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

	for i, note := range index.Notes {
		if note.ID == id {
			filename := note.Filename
			index.Notes = append(index.Notes[:i], index.Notes[i+1:]...)

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
	}

	return fmt.Errorf("no note found with ID: %s", id)
}

func UpdateNote(note *api.Note) error {
	index, err := LoadIndex()
	if err != nil {
		return err
	}

	updatedAt, err := time.Parse(time.RFC3339, note.UpdatedAt)
	if err != nil {
		return err
	}

	found := false
	for i := range index.Notes {
		if index.Notes[i].ID == note.ID {
			index.Notes[i].UpdatedAt = updatedAt
			found = true
			break
		}
	}

	if !found {
		return fmt.Errorf("note note found in local storage")
	}

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

func WriteNoteContent(filename string, content string) error {
	dir, err := token.GetConfigDir()
	if err != nil {
		return fmt.Errorf("failed to get config directory: %w", err)
	}

	return os.WriteFile(filepath.Join(dir, filename), []byte(content), 0600)
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

	found := false
	for i := range index.Notes {
		if index.Notes[i].ID == newNote.ID {
			index.Notes[i].Title = newNote.Title
			index.Notes[i].Tags = newNote.Tags
			index.Notes[i].Filename = newFilename
			index.Notes[i].UpdatedAt = updatedAt
			found = true
			break
		}
	}

	if !found {
		return fmt.Errorf("note not found in local storage")
	}

	if err := SaveIndex(index); err != nil {
		return fmt.Errorf("failed to update index: %w", err)
	}

	return nil
}
