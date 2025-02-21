package api

type UserResponse struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	OAuth    bool   `json:"oauth"`
	Provider string `json:"provider"`
	ID       string `json:"id"`
}

func (c *Client) GetMe() (*UserResponse, error) {
	resp, err := c.doRequest("GET", "/auth/me", nil)
	if err != nil {
		return nil, err
	}

	var user UserResponse
	if err := c.handleResponse(resp, &user); err != nil {
		return nil, err
	}

	return &user, nil
}
