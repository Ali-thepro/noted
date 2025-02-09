package storage

import (
	"fmt"
	"noted/internal/api"
	"noted/internal/token"
	"noted/internal/utils"
	"os"
	"path/filepath"
	"time"
)

type SyncStats struct {
	NewNotes     int
	UpdatedNotes int
	TotalNotes   int
	DeletedNotes int
}

func SyncNotes() (*SyncStats, error) {
	index, err := LoadIndex()
	if err != nil {
		return nil, fmt.Errorf("failed to load index: %w", err)
	}

	client, err := api.NewClient()
	if err != nil {
		return nil, fmt.Errorf("failed to create client: %w", err)
	}

	serverNotes, err := client.GetNoteMetadata(index.LastSync)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch metadata: %w", err)
	}

	idMap := make(map[string]int, len(index.Notes))
	for i, note := range index.Notes {
		idMap[note.ID] = i
	}

	stats := &SyncStats{}

	deletedNotes, err := client.GetDeletedNotes(index.LastSync)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch deleted notes: %w", err)
	}

	for _, deletedNote := range deletedNotes {
		if err := DeleteNoteForSync(deletedNote.ID, index, idMap); err != nil {
			return nil, fmt.Errorf("failed to delete note %s: %w", deletedNote.ID, err)
		}
		stats.DeletedNotes++
	}

	var notesToFetch []string

	for _, serverNote := range serverNotes {
		idx, exists := idMap[serverNote.ID]

		serverTime, err := time.Parse(time.RFC3339, serverNote.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("invalid server timestamp: %w", err)
		}

		if !exists {
			notesToFetch = append(notesToFetch, serverNote.ID)
			stats.NewNotes++
			continue
		}

		localNote := index.Notes[idx]
		if serverTime.After(localNote.UpdatedAt) {
			notesToFetch = append(notesToFetch, serverNote.ID)
			stats.UpdatedNotes++
		}
	}

	if len(notesToFetch) > 0 {
		notes, err := client.GetBulkNotes(notesToFetch)
		if err != nil {
			return nil, fmt.Errorf("failed to fetch notes: %w", err)
		}

		for _, note := range notes {
			if _, err := AddNoteForSync(note, index, idMap); err != nil {
				return nil, fmt.Errorf("failed to save note %s: %w", note.ID, err)
			}
		}
	}

	index.LastSync = time.Now()
	if err := SaveIndex(index); err != nil {
		return nil, fmt.Errorf("failed to update sync time: %w", err)
	}

	stats.TotalNotes = stats.NewNotes + stats.UpdatedNotes + stats.DeletedNotes
	return stats, nil
}

func AddNoteForSync(note *api.Note, index *Index, idMap map[string]int) (*Note, error) {
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

	if idx, exists := idMap[note.ID]; exists {
		if index.Notes[idx].Filename != filename {
			oldPath := filepath.Join(dir, index.Notes[idx].Filename)
			if err := os.Remove(oldPath); err != nil && !os.IsNotExist(err) {
				return nil, fmt.Errorf("failed to remove old note file: %w", err)
			}
		}
		index.Notes[idx] = newNote
	} else {
		index.Notes = append(index.Notes, newNote)
		idMap[note.ID] = len(index.Notes) - 1
	}

	notePath := filepath.Join(dir, filename)
	if err := os.WriteFile(notePath, []byte(note.Content), 0600); err != nil {
		return nil, fmt.Errorf("failed to write note file: %w", err)
	}

	return &newNote, nil
}

func DeleteNoteForSync(id string, index *Index, idMap map[string]int) error {
	idx, exists := idMap[id]
	if !exists {
		return nil
	}

	if idx < 0 || idx >= len(index.Notes) {
		return fmt.Errorf("invalid index %d for note %s (total notes: %d)",
			idx, id, len(index.Notes))
	}

	dir, err := token.GetConfigDir()
	if err != nil {
		return fmt.Errorf("failed to get config directory: %w", err)
	}

	notePath := filepath.Join(dir, index.Notes[idx].Filename)
	if err := os.Remove(notePath); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("failed to delete note file: %w", err)
	}

	index.Notes = append(index.Notes[:idx], index.Notes[idx+1:]...)

	for noteID, noteIdx := range idMap {
		if noteIdx > idx {
			idMap[noteID] = noteIdx - 1
		}
	}

	delete(idMap, id)

	return nil
}
