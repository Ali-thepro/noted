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

	serverNotes, err := client.GetNoteMetadata(index.LastSync, opts.Tag)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch metadata: %w", err)
	}

	stats := &SyncStats{}
	var notesToFetch []string

	for _, serverNote := range *serverNotes {
		idx, exists := index.idMap[serverNote.ID]

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
			if _, err := AddNote(note, index); err != nil {
				return nil, fmt.Errorf("failed to save note %s: %w", note.ID, err)
			}
		}
	}

	index.LastSync = time.Now()
	if err := SaveIndex(index); err != nil {
		return nil, fmt.Errorf("failed to update sync time: %w", err)
	}

	stats.TotalNotes = len(notesToFetch)
	return stats, nil
}
