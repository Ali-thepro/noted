package cmd

import (
	"fmt"
	"github.com/spf13/cobra"
	"noted/internal/config"
	"strings"
)

var themeCmd = &cobra.Command{
	Use:   "theme [theme-name]",
	Short: "Set or view the markdown rendering theme",
	Long: `Set or view the theme used for markdown rendering.
Available themes: auto, dark, light, ascii, dracula, tokyo-night, notty, pink

If no theme is provided, the current theme will be displayed.`,
	RunE: func(cmd *cobra.Command, args []string) error {
		cfg := config.NewConfig()

		if len(args) == 0 {
			fmt.Printf("Current theme: %s\n", cfg.Theme)
			fmt.Println("\nAvailable themes:")
			fmt.Println("- auto (automatically detect based on terminal)")
			for _, theme := range config.ValidThemes {
				fmt.Printf("- %s\n", theme)
			}
			return nil
		}

		newTheme := strings.ToLower(args[0])
		if !config.IsValidTheme(newTheme) {
			return fmt.Errorf("invalid theme '%s'. Current theme: %s. Available themes: auto, %s",
				newTheme,
				cfg.Theme,
				strings.Join(config.ValidThemes, ", "),
			)
		}

		cfg.Theme = newTheme
		if err := config.SaveConfig(cfg); err != nil {
			return fmt.Errorf("failed to save config: %w", err)
		}

		fmt.Printf("Theme updated to: %s\n", newTheme)
		return nil
	},
}

func init() {
	rootCmd.AddCommand(themeCmd)
}
