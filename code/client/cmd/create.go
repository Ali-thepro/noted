package cmd

import (
	"fmt"
	"github.com/spf13/cobra"
	"noted/internal/api"
	"noted/internal/metadata"
	"strings"
)

var createCmd = &cobra.Command{
	Use:   "create",
	Short: "Create a new note",
	RunE: func(cmd *cobra.Command, args []string) error {
		title, err := cmd.Flags().GetString("title")
		if err != nil {
			return err
		}
		if title == "" {
			return fmt.Errorf("title is required, it cannot be an empty string")
		}

		tags, err := cmd.Flags().GetStringSlice("tags")
		if err != nil {
			return err
		}

		validTags, err := validateTags(tags)
		if err != nil {
			return err
		}

		client, err := api.NewClient()
		if err != nil {
			return err
		}

		note, err := client.CreateNote(api.CreateNoteRequest{
			Title:   title,
			Content: fmt.Sprintf("# %s\n\nStart writing here...", title),
			Tags:    validTags,
		})
		if err != nil {
			return err
		}

		_, err = metadata.AddNote(note.ID, note.Title, note.Tags, note.Content)
		if err != nil {
			return fmt.Errorf("failed to save note metadata: %w", err)
		}

		fmt.Printf("Note created successfully!\n")
		fmt.Printf("ID: %s\n", note.ID)
		fmt.Printf("Title: %s\n", note.Title)
		if len(note.Tags) > 0 {
			fmt.Printf("Tags: %v\n", note.Tags)
		}

		return nil

	},
}

func validateTags(tags []string) ([]string, error) {
	if len(tags) == 0 {
		return tags, nil
	}

	tagSet := make(map[string]struct{})
	validTags := make([]string, 0, len(tags))

	for _, tag := range tags {
		trimmedTag := strings.ToLower(strings.TrimSpace(tag))

		if trimmedTag == "" {
			return nil, fmt.Errorf("tag cannot be empty")
		}

		if len(trimmedTag) > 20 {
			return nil, fmt.Errorf("tag '%s' exceeds maximum length of 20 characters", trimmedTag)
		}

		if _, ok := tagSet[trimmedTag]; ok {
			return nil, fmt.Errorf("duplicate tag '%s' found - tags must be unique", trimmedTag)
		}
		tagSet[trimmedTag] = struct{}{}

		validTags = append(validTags, trimmedTag)
	}

	return validTags, nil
}

func init() {
	rootCmd.AddCommand(createCmd)
	createCmd.Flags().StringP("title", "t", "", "Title of the note")
	createCmd.Flags().StringSlice("tags", []string{}, "Tags for the note (comma separated)")
}
