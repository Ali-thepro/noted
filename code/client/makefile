.PHONY: build clean

BINARY_NAME=noted

build:
	go build -o $(BINARY_NAME) main.go

build-linux:
	GOOS=linux GOARCH=amd64 go build -o $(BINARY_NAME)-linux main.go

build-darwin:
	GOOS=darwin GOARCH=amd64 go build -o $(BINARY_NAME)-darwin main.go

build-windows:
	GOOS=windows GOARCH=amd64 go build -o $(BINARY_NAME).exe main.go

clean:
	rm -f $(BINARY_NAME) $(BINARY_NAME)-linux $(BINARY_NAME)-darwin $(BINARY_NAME).exe

lint:
	golangci-lint run

fmt:
	go fmt ./...

vet:
	go vet ./...