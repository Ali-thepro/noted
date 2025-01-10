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

		client, err := api.NewClient()
		if err != nil {
			return fmt.Errorf("failed to create API client: %w", err)
		}
		result, err := client.UploadImage(args[0])
		if err != nil {
			return err
		}

		fmt.Printf("Image uploaded successfully - please use this URL in your markdown note: %s\n", result.URL)
		if copyFlag {
			clipboardManager := clipboard.NewManager(auth.IsWSL())
			if err := clipboardManager.CopyToClipboard(result.URL); err != nil {
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
