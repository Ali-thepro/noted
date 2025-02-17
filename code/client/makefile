.PHONY: build build-linux build-darwin build-windows clean lint fmt vet

BINARY_NAME=noted
INSTALL_DIR=$(HOME)/.noted
build:
	go build -o $(BINARY_NAME) main.go

install: build
	# Create installation directory
	mkdir -p $(INSTALL_DIR)
	
	# Copy binary to install directory
	cp $(BINARY_NAME) $(INSTALL_DIR)/$(BINARY_NAME)
	
	# Copy wrapper script
	cp scripts/noted-wrapper.sh $(INSTALL_DIR)/wrapper.sh
	chmod +x $(INSTALL_DIR)/wrapper.sh
	
	@echo "Installation complete!"
	@echo "Please add this line to your ~/.bashrc or ~/.zshrc:"
	@echo "source $(INSTALL_DIR)/wrapper.sh"
	@echo ""
	@echo "Then either run 'source ~/.bashrc' (or ~/.zshrc) or restart your terminal"
	rm -f $(BINARY_NAME)

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