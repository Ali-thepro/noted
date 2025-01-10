package cmd

import (
	"noted/internal/api"
	"github.com/spf13/cobra"
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
		return api.UploadImage(args[0])
	},
}

func init() {
	rootCmd.AddCommand(imageCmd)
	imageCmd.AddCommand(uploadCmd)
}
