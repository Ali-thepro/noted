package cmd

import (
	"noted/internal/api"
	"github.com/spf13/cobra"
	"noted/internal/clipboard"
	"noted/internal/auth"
	"fmt"
)

var imageCmd = &cobra.Command{
	Use:   "image",
	Short: "Image management commands",
	Long:  `Commands for handling image operations such as upload`,
}

var uploadCmd = &cobra.Command{
	Use:   "upload [filepath]",
	Short: "Upload an image",
	Long:  `Upload an image file to the server and receive a URL`,
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		copyFlag, err := cmd.Flags().GetBool("copy")
		if err != nil {
			return err
		}

		url, err := api.UploadImage(args[0])
		if err != nil {
			return err
		}

		if copyFlag {
			clipboardManager := clipboard.NewManager(auth.IsWSL())
			if err := clipboardManager.CopyToClipboard(url); err != nil {
				return fmt.Errorf("failed to copy URL to clipboard: %w", err)
			}
			fmt.Println("URL copied to clipboard!")
		}

		return nil
	},
}

func init() {
	rootCmd.AddCommand(imageCmd)
	imageCmd.AddCommand(uploadCmd)
	uploadCmd.Flags().BoolP("copy", "c", false, "Copy the image URL to the clipboard")
}
