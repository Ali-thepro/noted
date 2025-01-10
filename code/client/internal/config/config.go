package config

type Config struct {
	APIURL string
}

func NewConfig() *Config {
	return &Config{
		APIURL: "http://localhost:3000/api",
	}
}
