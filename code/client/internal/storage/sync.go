package storage

import (
	"fmt"
	"noted/internal/api"
	"time"
)

type SyncStats struct {
	NewNotes     int
	UpdatedNotes int
	TotalNotes   int
}

type SyncOptions struct {
	Tag string
}

func SyncNotes(opts SyncOptions) (*SyncStats, error) {
	index, err := LoadIndex()
	if err != nil {
		return nil, fmt.Errorf("failed to load index: %w", err)
	}

	client, err := api.NewClient()
	if err != nil {
		return nil, fmt.Errorf("failed to create client: %w", err)
	}
	metadata, err := client.GetNoteMetadata(index.LastSync, opts.Tag)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch metadata: %w", err)
	}

	var notesToFetch []string
	noteMap := make(map[string]Note)
	for _, note := range index.Notes {
		noteMap[note.ID] = note
	}

	stats := &SyncStats{}

	for _, serverNote := range *metadata {
		localNote, exists := noteMap[serverNote.ID]

		if !exists {
			notesToFetch = append(notesToFetch, serverNote.ID)
			stats.NewNotes++
			continue
		}

		serverTime, err := time.Parse(time.RFC3339, serverNote.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("invalid server timestamp: %w", err)
		}

		if serverTime.After(localNote.UpdatedAt) {
			notesToFetch = append(notesToFetch, serverNote.ID)
			stats.UpdatedNotes++
		}
	}

	stats.TotalNotes = len(*metadata)

	if len(notesToFetch) == 0 {
		return stats, nil
	}

	notes, err := client.GetBulkNotes(notesToFetch)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch notes: %w", err)
	}

	for _, note := range notes {
		if _, err := AddNote(note, index); err != nil {
			return nil, fmt.Errorf("failed to save note %s: %w", note.ID, err)
		}
	}

	index.LastSync = time.Now()
	if err := SaveIndex(index); err != nil {
		return nil, fmt.Errorf("failed to update sync time: %w", err)
	}

	return stats, nil
}
