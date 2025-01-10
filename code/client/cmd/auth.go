package cmd

import (
	"github.com/spf13/cobra"
	"noted/internal/api"
	"noted/internal/auth"
)

var authCmd = &cobra.Command{
	Use:   "auth",
	Short: "Authentication commands",
	Long:  `Commands for handling authentication such as login and logout`,
}

var loginCmd = &cobra.Command{
	Use:   "login",
	Short: "Login to your account",
	Long:  `Login to your account using web authentication`,
	RunE: func(cmd *cobra.Command, args []string) error {
		return auth.HandleLogin()
	},
}

var logoutCmd = &cobra.Command{
	Use:   "logout",
	Short: "Logout from your account",
	Long:  `Logout from your account and remove stored credentials`,
	RunE: func(cmd *cobra.Command, args []string) error {
		return auth.HandleLogout()
	},
}

var meCmd = &cobra.Command{
	Use:   "me",
	Short: "Get current user details",
	Long:  `Fetch and display the current authenticated user's details`,
	RunE: func(cmd *cobra.Command, args []string) error {
		return api.GetMe()
	},
}

func init() {
	rootCmd.AddCommand(authCmd)
	authCmd.AddCommand(loginCmd)
	authCmd.AddCommand(logoutCmd)
	authCmd.AddCommand(meCmd)
}
